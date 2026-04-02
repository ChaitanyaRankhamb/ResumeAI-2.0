import {
  AuthProvider,
  ProviderType,
} from "../../../entities/user/AuthProvider";
import { User } from "../../../entities/user/user";
import { UserId } from "../../../entities/user/userId";

import type {
  UserRepository as IUserRepository,
  CreateUserData,
} from "../../../entities/user/userRepo";
import { AppError } from "../../../Error/appError";

import { UserModel, type UserDocument } from "../user/userModel";

function docToUser(doc: UserDocument): User {
  const providers = doc.providers.map(
    (p) => new AuthProvider(p.type, p.providerId),
  );

  return new User(
    new UserId(doc._id.toString()),
    doc.email,
    doc.username,
    doc.avatar,
    doc.emailVerified,
    doc.isActive,
    providers,
    doc.verificationCode,
    doc.verificationExpiry,
    doc.createdAt,
    doc.updatedAt,
  );
}

export class MongoUserRepository implements IUserRepository {
  async createUser(data: CreateUserData): Promise<User> {
    const providers = data.providers.map((p) => ({
      type: p.type,
      providerId: p.getProviderUserId(),
    }));

    const doc = await UserModel.create({
      email: data.email,
      username: data.username,
      avatar: data.avatar,
      emailVerified: data.emailVerified ?? false,
      verificationCode: data.verificationCode,
      verificationExpiry: data.verificationExpiry,
      isActive: data.isActive ?? true,
      providers,
    });

    return docToUser(doc);
  }

  async updateUser(user: User): Promise<User> {
    const providers = user.getProviders().map((p) => ({
      type: p.type,
      providerId: p.getProviderUserId(),
    }));

    const doc = await UserModel.findByIdAndUpdate(
      user.id.toString(),
      {
        email: user.getEmail(),
        username: user.getUsername(),
        avatar: user.getAvatar(),
        emailVerified: user.isEmailVerified(),
        verificationCode: user.getVerificationCode(),
        verificationExpriry: user.getVerificationExpiry(),
        isActive: user.isUserActive(),
        providers,
      },
      { new: true },
    );

    if (!doc) throw new AppError("User not found", 404);

    return docToUser(doc);
  }

  async deleteUser(id: UserId): Promise<User | null> {
    const doc = await UserModel.findByIdAndDelete(id.toString());
    return doc ? docToUser(doc) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? docToUser(doc) : null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username });
    return doc ? docToUser(doc) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      email: email.toLowerCase(),
    });
    return doc ? docToUser(doc) : null;
  }

  async findByProvider(
    type: ProviderType,
    providerId: string,
  ): Promise<User | null> {
    const doc = await UserModel.findOne({
      providers: {
        $elemMatch: { type, providerId },
      },
    });

    return doc ? docToUser(doc) : null;
  }
}

export const userRepository = new MongoUserRepository();
