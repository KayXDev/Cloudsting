import { env } from "@/server/env";

type PteroApplicationUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
};

type PteroCollectionResponse<T> = {
  data: Array<{ attributes: T }>;
};

type PteroApplicationServer = {
  id: number;
  identifier: string;
  name: string;
  node: number;
  allocation: number;
  limits: {
    memory: number;
    cpu: number;
    disk: number;
  };
};

type PteroAllocation = {
  id: number;
  ip: string;
  port: number;
  assigned: boolean;
};

class PterodactylApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class PterodactylClient {
  private baseUrl: string;
  private applicationApiKey?: string;
  private clientApiKey?: string;

  constructor() {
    if (!env.PTERO_URL) {
      throw new Error("Pterodactyl is not configured (PTERO_URL).");
    }

    this.baseUrl = env.PTERO_URL.replace(/\/$/, "");
    this.applicationApiKey = env.PTERO_APPLICATION_API_KEY;
    this.clientApiKey = env.PTERO_CLIENT_API_KEY;
  }

  private async request<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      ...init,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "Application/vnd.pterodactyl.v1+json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      throw new PterodactylApiError(res.status, `Pterodactyl API error ${res.status}: ${text}`);
    }

    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  private async requestApplication<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.applicationApiKey) {
      throw new Error("Pterodactyl Application API is not configured (PTERO_APPLICATION_API_KEY).");
    }
    return this.request<T>(path, this.applicationApiKey, init);
  }

  private async requestClient<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.clientApiKey) {
      throw new Error(
        "Pterodactyl Client API is not configured (PTERO_CLIENT_API_KEY). Create a Client API key (ptlc_...) in the Panel user settings and set it server-side."
      );
    }
    return this.request<T>(path, this.clientApiKey, init);
  }

  async createUser(input: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<PteroApplicationUser> {
    const res = await this.requestApplication<{ object: string; attributes: PteroApplicationUser }>(
      "/api/application/users",
      {
        method: "POST",
        body: JSON.stringify({
          email: input.email,
          username: input.username,
          first_name: input.firstName,
          last_name: input.lastName,
          password: input.password,
        }),
      }
    );

    return res.attributes;
  }

  async findUserByEmail(email: string): Promise<PteroApplicationUser | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const query = encodeURIComponent(normalizedEmail);

    try {
      const filtered = await this.requestApplication<PteroCollectionResponse<PteroApplicationUser>>(
        `/api/application/users?filter[email]=${query}`
      );

      const exact = filtered.data
        .map((entry) => entry.attributes)
        .find((user) => user.email.trim().toLowerCase() === normalizedEmail);

      if (exact) return exact;
    } catch {
      // Fall through to broader lookup.
    }

    let page = 1;
    while (true) {
      const fallback = await this.requestApplication<
        PteroCollectionResponse<PteroApplicationUser> & { meta?: { pagination?: { total_pages?: number } } }
      >(`/api/application/users?page=${page}&per_page=100`);

      const exact = fallback.data
        .map((entry) => entry.attributes)
        .find((user) => user.email.trim().toLowerCase() === normalizedEmail);

      if (exact) return exact;

      const totalPages = fallback.meta?.pagination?.total_pages ?? 1;
      if (page >= totalPages) {
        return null;
      }

      page += 1;
    }
  }

  async createServer(input: {
    name: string;
    userId: number;
    eggId: number;
    dockerImage: string;
    startup: string;
    environment: Record<string, string>;
    limits: { memory: number; cpu: number; disk: number; swap?: number; io?: number };
    featureLimits?: { databases?: number; allocations?: number; backups?: number };
    allocation: { default: number };
  }): Promise<PteroApplicationServer> {
    const res = await this.requestApplication<{ object: string; attributes: PteroApplicationServer }>(
      "/api/application/servers",
      {
        method: "POST",
        body: JSON.stringify({
          name: input.name,
          user: input.userId,
          egg: input.eggId,
          docker_image: input.dockerImage,
          startup: input.startup,
          environment: input.environment,
          limits: {
            memory: input.limits.memory,
            cpu: input.limits.cpu,
            disk: input.limits.disk,
            swap: input.limits.swap ?? 0,
            io: input.limits.io ?? 500,
          },
          feature_limits: {
            databases: input.featureLimits?.databases ?? 0,
            allocations: input.featureLimits?.allocations ?? 1,
            backups: input.featureLimits?.backups ?? 1,
          },
          allocation: input.allocation,
          start_on_completion: true,
        }),
      }
    );

    return res.attributes;
  }

  async getServer(serverId: number): Promise<PteroApplicationServer | null> {
    try {
      const res = await this.requestApplication<{ object: string; attributes: PteroApplicationServer }>(
        `/api/application/servers/${serverId}`
      );

      return res.attributes;
    } catch (err) {
      if (err instanceof PterodactylApiError && err.status === 404) {
        return null;
      }

      throw err;
    }
  }

  async power(identifier: string, signal: "start" | "stop" | "restart" | "kill") {
    await this.requestClient(`/api/client/servers/${identifier}/power`, {
      method: "POST",
      body: JSON.stringify({ signal }),
    });
  }

  async suspendServer(serverId: number) {
    await this.requestApplication(`/api/application/servers/${serverId}/suspend`, {
      method: "POST",
    });
  }

  async unsuspendServer(serverId: number) {
    await this.requestApplication(`/api/application/servers/${serverId}/unsuspend`, {
      method: "POST",
    });
  }

  async listNodes() {
    return this.requestApplication<{ data: Array<{ attributes: any }> }>("/api/application/nodes");
  }

  async listNodeAllocations(nodeId: number, perPage = 100) {
    const res = await this.requestApplication<{ data: Array<{ attributes: PteroAllocation }> }>(
      `/api/application/nodes/${nodeId}/allocations?per_page=${perPage}`
    );
    return res.data.map((d) => d.attributes);
  }
}
