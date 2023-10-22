export interface IMapper<T> {
    toJSON(entity: T): any;
    toEntity(json: any): T;
}
