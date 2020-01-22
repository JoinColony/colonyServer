import { ETH_ADDRESS } from './constants';

export const isETH = (address: string) => address === ETH_ADDRESS || address === '0x0';
