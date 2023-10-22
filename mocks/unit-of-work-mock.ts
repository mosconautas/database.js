import { IUnitOfWork } from "../src";

export class UnitOfWorkMock<T = any> implements IUnitOfWork<T> {
    public declare transaction: T;

    public commit = jest.fn();
    public rollback = jest.fn();

    public mockTransaction(transaction: T): void {
        this.transaction = transaction;
    }

    public mockCommit(once: boolean = false): void {
        if (once) {
            this.commit.mockResolvedValueOnce(undefined);
        } else {
            this.commit.mockResolvedValue(undefined);
        }
    }

    public mockCommitError(error: Error, once: boolean = false): void {
        if (once) {
            this.commit.mockRejectedValueOnce(error);
        } else {
            this.commit.mockRejectedValue(error);
        }
    }

    public mockRollback(once: boolean = false): void {
        if (once) {
            this.rollback.mockResolvedValueOnce(undefined);
        } else {
            this.rollback.mockResolvedValue(undefined);
        }
    }

    public mockRollbackError(error: Error, once: boolean = false): void {
        if (once) {
            this.rollback.mockRejectedValueOnce(error);
        } else {
            this.rollback.mockRejectedValue(error);
        }
    }

    public assertCommitCalled(times: number): void {
        expect(this.commit).toHaveBeenCalledTimes(times);
    }

    public assertCommitCalledWith(value: any, nth?: number): void {
        if (nth === undefined) {
            expect(this.commit).toHaveBeenCalledWith(value);
        } else {
            expect(this.commit).toHaveBeenNthCalledWith(nth, value);
        }
    }

    public assertRollbackCalled(times: number): void {
        expect(this.rollback).toHaveBeenCalledTimes(times);
    }

    public assertRollbackCalledWith(value: any, nth?: number): void {
        if (nth === undefined) {
            expect(this.rollback).toHaveBeenCalledWith(value);
        } else {
            expect(this.rollback).toHaveBeenNthCalledWith(nth, value);
        }
    }

    public reset() {
        this.commit.mockReset();
        this.rollback.mockReset();
    }
}