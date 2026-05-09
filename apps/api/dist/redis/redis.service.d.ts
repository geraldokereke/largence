import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    expire(key: string, seconds: number): Promise<void>;
    keys(pattern: string): Promise<string[]>;
    pipeline(): import("ioredis").ChainableCommander;
    getJson<T>(key: string): Promise<T | null>;
    setJson(key: string, value: any, ttlSeconds?: number): Promise<void>;
}
