import { CollectionReference, FieldPath, Firestore, Query, WriteBatch } from "@google-cloud/firestore";
import { IMapper } from "./mapper";
import { Filter, FilterMany, FilterPage, IReadRepository, IWriteRepository, Page } from "./repository";
import { IUnitOfWork } from "./unit-of-work";

export class FirestoreUnitOfWork implements IUnitOfWork<WriteBatch> {
    private _batch?: WriteBatch;
    public get transaction() {
        if (!this._batch) {
            this._batch = this.firestore.batch()
        }

        return this._batch;
    }

    constructor(public readonly firestore: Firestore) {
    }

    public async commit(): Promise<void> {
        await this.transaction.commit();
    }

    public async rollback(): Promise<void> {
        this._batch = this.firestore.batch();
    }
}

export class FirestoreRepository<T extends { id: string | number }> implements IReadRepository<T>, IWriteRepository<T> {
    constructor(
        private readonly _mapper: IMapper<T>,
        private readonly _collection: CollectionReference,
        private readonly _unitOfWork?: IUnitOfWork<WriteBatch>,
    ) { }

    public async find(filter?: FilterMany<T>): Promise<T[]> {
        const take = filter?.take ? Math.min(filter?.take, 100) : 50
        const snapshot = await this._filter(this._collection.limit(take), filter).get();
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map((doc) => this._mapper.toEntity(doc));
    }

    public async findOne(filter: Filter<T>): Promise<T | null> {
        const snapshot = await this._filter(this._collection.limit(1), filter).get();

        if (snapshot.empty) {
            return null;
        }

        return this._mapper.toEntity(snapshot.docs[0]);
    }

    public async paginate(input?: FilterPage<T>): Promise<Page<T>> {
        const { type, ref, take, where, orderBy, page } = input?.pageToken ? this._decode(input?.pageToken) : {} as any;

        const filter = {
            page: page ?? 0,
            take: take ?? (input?.take ? Math.min(input!.take!, 100) : 50),
            where: where ?? input?.where,
            orderBy: orderBy ?? input?.orderBy,
        }

        let query = this._collection.limit(filter.take);

        if (ref) {
            switch (type) {
                case "next":
                    query = query.orderBy(FieldPath.documentId()).startAfter(ref).limit(filter.take);
                    break;
                case "prev":
                    query = query.orderBy(FieldPath.documentId()).endBefore(ref).limitToLast(filter.take);
                    break;
                default:
                    throw new Error("Invalid page token");
            }
        } else {
            query = query.orderBy(FieldPath.documentId()).limit(filter.take);
        }


        const snapshot = await this._filter(query, filter).get();
        const prevPageToken = filter.page > 0 && input?.pageToken ? snapshot.docs[0]?.id : undefined;
        const nextPageToken = snapshot.docs.length === filter.take ? snapshot.docs[snapshot.docs.length - 1]?.id : undefined;

        return {
            data: snapshot.docs.map((doc) => this._mapper.toEntity(doc)),
            nextPageToken: nextPageToken ? this._encode(Object.assign(filter, { type: "next", page: filter.page + 1, ref: nextPageToken })) : null,
            prevPageToken: prevPageToken ? this._encode(Object.assign(filter, { type: "prev", page: filter.page - 1, ref: prevPageToken })) : null,
        }
    }

    public async create(entity: T): Promise<void> {
        if (this._unitOfWork) {
            this._unitOfWork.transaction.create(this._collection.doc(entity.id.toString()), this._mapper.toJSON(entity))
            return;
        }

        await this._collection.doc(entity.id.toString()).create(this._mapper.toJSON(entity))
    }

    public async update(entity: T): Promise<void> {
        if (this._unitOfWork) {
            this._unitOfWork.transaction.update(this._collection.doc(entity.id.toString()), this._mapper.toJSON(entity))
            return;
        }

        await this._collection.doc(entity.id.toString()).update(this._mapper.toJSON(entity))
    }


    public async deleteById(id: string | number): Promise<void> {
        if (this._unitOfWork) {
            this._unitOfWork.transaction.delete(this._collection.doc(id.toString()), { exists: true })
            return;
        }

        await this._collection.doc(id.toString()).delete({ exists: true })
    }

    private _filter(query: Query, filter?: Filter<T>) {
        if (filter?.where) {
            for (const [key, operation, value] of filter.where) {
                query = query.where(key as string, operation as any, value);
            }
        }

        if (filter?.orderBy) {
            for (const [key, order] of filter.orderBy) {
                query = query.orderBy(key as string, order)
            }
        }

        return query;
    }

    private _decode(str: string) {
        return JSON.parse(Buffer.from(str, "base64").toString("utf-8"));
    }

    private _encode(obj: object) {
        return Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");
    }
}
