export interface DeviceRepo {
  upsertForUser(params: {
    userId: string;
    deviceId: string;
    platform: "IOS" | "ANDROID";
    model?: string | null;
    osVersion?: string | null;
    appVersion?: string | null;
  }): Promise<{ id: string }>;
}
export default DeviceRepo;