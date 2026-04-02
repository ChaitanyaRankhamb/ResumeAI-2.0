// It is a class for the UserId. It will return the userId as a string.
export class UserId {
  constructor(private readonly value: string) {}

  public toString(): string {
    return this.value;
  }
}
