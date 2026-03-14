import net from "net";

export type MinecraftStatusResponse = {
  version?: { name?: string; protocol?: number };
  players?: { max?: number; online?: number; sample?: Array<{ name: string; id: string }> };
  description?: any;
  favicon?: string;
};

function encodeVarInt(value: number): Buffer {
  const out: number[] = [];
  let v = value >>> 0;
  while (true) {
    if ((v & 0xffffff80) === 0) {
      out.push(v);
      return Buffer.from(out);
    }
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
}

function decodeVarInt(buffer: Buffer, offset: number): { value: number; size: number } {
  let numRead = 0;
  let result = 0;
  let read: number;
  do {
    if (offset + numRead >= buffer.length) {
      throw new Error("VarInt exceeds buffer length");
    }
    read = buffer[offset + numRead] as number;
    const value = read & 0x7f;
    result |= value << (7 * numRead);

    numRead++;
    if (numRead > 5) throw new Error("VarInt is too big");
  } while ((read & 0x80) !== 0);

  return { value: result, size: numRead };
}

function encodeString(str: string): Buffer {
  const s = Buffer.from(str, "utf8");
  return Buffer.concat([encodeVarInt(s.length), s]);
}

function writePacket(packetId: number, payload: Buffer): Buffer {
  const id = encodeVarInt(packetId);
  const data = Buffer.concat([id, payload]);
  return Buffer.concat([encodeVarInt(data.length), data]);
}

async function readExactly(socket: net.Socket, totalBytes: number, timeoutMs: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let received = 0;

  return await new Promise<Buffer>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("close", onClose);
    }

    function onError(err: Error) {
      cleanup();
      reject(err);
    }

    function onClose() {
      cleanup();
      reject(new Error("socket closed"));
    }

    function onData(data: Buffer) {
      chunks.push(data);
      received += data.length;

      if (received >= totalBytes) {
        cleanup();
        const all = Buffer.concat(chunks);
        resolve(all.subarray(0, totalBytes));
      }
    }

    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("close", onClose);
  });
}

async function readVarIntFromSocket(socket: net.Socket, timeoutMs: number): Promise<number> {
  const bytes: number[] = [];
  for (let i = 0; i < 5; i++) {
    const b = (await readExactly(socket, 1, timeoutMs))[0] as number;
    bytes.push(b);
    if ((b & 0x80) === 0) break;
  }
  const { value } = decodeVarInt(Buffer.from(bytes), 0);
  return value;
}

/**
 * Minimal Minecraft Server List Ping (status) implementation.
 *
 * Works for most modern servers; returns `players.online` when provided.
 */
export async function pingMinecraftStatus(host: string, port = 25565, timeoutMs = 1500): Promise<MinecraftStatusResponse> {
  const socket = new net.Socket();

  return await new Promise<MinecraftStatusResponse>((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error("timeout"));
    }, timeoutMs);

    function done(err?: Error, res?: MinecraftStatusResponse) {
      clearTimeout(timeout);
      socket.removeAllListeners();
      socket.destroy();
      if (err) reject(err);
      else resolve(res ?? {});
    }

    socket.once("error", (err) => done(err));

    socket.connect(port, host, async () => {
      try {
        // Handshake (packet id 0x00)
        // Protocol version: pick a modern value; servers typically still return status even if mismatched.
        const protocolVersion = 765; // ~1.20.x
        const handshakePayload = Buffer.concat([
          encodeVarInt(protocolVersion),
          encodeString(host),
          Buffer.from([(port >> 8) & 0xff, port & 0xff]),
          encodeVarInt(1), // next state: status
        ]);
        socket.write(writePacket(0x00, handshakePayload));

        // Status request (packet id 0x00, empty payload)
        socket.write(writePacket(0x00, Buffer.alloc(0)));

        // Response: length (varint) + packetId (varint) + json string
        const packetLength = await readVarIntFromSocket(socket, timeoutMs);
        const packet = await readExactly(socket, packetLength, timeoutMs);

        const packetIdDecoded = decodeVarInt(packet, 0);
        const packetId = packetIdDecoded.value;
        if (packetId !== 0x00) throw new Error(`unexpected packet id ${packetId}`);

        const jsonLenDecoded = decodeVarInt(packet, packetIdDecoded.size);
        const jsonStart = packetIdDecoded.size + jsonLenDecoded.size;
        const jsonStr = packet.subarray(jsonStart, jsonStart + jsonLenDecoded.value).toString("utf8");

        const parsed = JSON.parse(jsonStr) as MinecraftStatusResponse;
        done(undefined, parsed);
      } catch (err: any) {
        done(err instanceof Error ? err : new Error(String(err)));
      }
    });
  });
}
