export type Conditions = "==" | "!=" | "<=" | "<" | ">" | ">=" | "in" | "not-in" | "like"
export type Where<K> = [K, Conditions, any][]
export type OrderBy<K> = [K, "asc" | "desc"][];

export interface Filter<T> {
    where?: Where<keyof T>;
    orderBy?: OrderBy<keyof T>
}

export interface FilterMany<T> extends Filter<T> {
    /** @description max result is 100 */
    take?: number;
}

export interface FilterPage<T> extends FilterMany<T> {
    pageToken?: string
}

export interface Page<T> {
    data: T[]
    nextPageToken?: string | null;
    prevPageToken?: string | null;
}

export interface IReadRepository<T extends { id: string | number }> {
    find(filter?: FilterMany<T>): Promise<T[]>;
    findOne(filter: Filter<T> & { where: Where<keyof T> }): Promise<T | null>;
    paginate(filter?: FilterPage<T>): Promise<Page<T>>
}

export interface IWriteRepository<T extends { id: string | number }> {
    create(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    deleteById(id: string | number): Promise<void>;
}
