import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface INetworkInfo {
  isConnected(): Promise<boolean>;
  observe(callback: (state: NetInfoState) => void): () => void;
}

export class NetworkInfo implements INetworkInfo {
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  observe(callback: (state: NetInfoState) => void): () => void {
    return NetInfo.addEventListener(callback);
  }
}
