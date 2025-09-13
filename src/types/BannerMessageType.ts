import type { BANNER_MESSAGE_TYPE } from './db-types/bannerMessageType';

export interface BannerMessage {
  type: typeof BANNER_MESSAGE_TYPE.SUCCESS | typeof BANNER_MESSAGE_TYPE.FAILURE;
  message: string;
}
