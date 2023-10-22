import { IMapper } from "../src";

export class MapperMock<T = any> implements IMapper<T> {
    public toEntity = jest.fn();
    public toJSON = jest.fn();

    public mockToEntity(entity: T, once: boolean = false): void {
        if (once) {
            this.toEntity.mockResolvedValueOnce(entity);
        } else {
            this.toEntity.mockReturnValue(entity);
        }
    }
    public mockToEntityError(error: Error, once: boolean = false): void {
        if (once) {
            this.toEntity.mockRejectedValueOnce(error);
        } else {
            this.toEntity.mockRejectedValue(error);
        }
    }

    public mockToJSON(json: any, once: boolean = false): void {
        if (once) {
            this.toJSON.mockResolvedValueOnce(json);
        } else {
            this.toJSON.mockReturnValue(json);
        }
    }

    public mockToJSONError(error: Error, once: boolean = false): void {
        if (once) {
            this.toJSON.mockRejectedValueOnce(error);
        } else {
            this.toJSON.mockRejectedValue(error);
        }
    }

    public assertToEntityCalled(times: number): void {
        expect(this.toEntity).toHaveBeenCalledTimes(times);
    }

    public assertToEntityCalledWith(value: any, nth?: number): void {
        if (nth === undefined) {
            expect(this.toEntity).toHaveBeenCalledWith(value);
        } else {
            expect(this.toEntity).toHaveBeenNthCalledWith(nth, value);
        }
    }

    public assertToJSONCalled(times: number): void {
        expect(this.toJSON).toHaveBeenCalledTimes(times);
    }

    public assertToJSONCalledWith(value: any, nth?: number): void {
        if (nth === undefined) {
            expect(this.toJSON).toHaveBeenCalledWith(value);
        } else {
            expect(this.toJSON).toHaveBeenNthCalledWith(nth, value);
        }
    }

    public reset(): void {
        this.toEntity.mockReset();
        this.toJSON.mockReset();
    }
}