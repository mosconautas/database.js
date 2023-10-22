export interface IUnitOfWork<T = any> {
    get transaction(): T

    commit(): Promise<void>;
    rollback(): Promise<void>;
}
