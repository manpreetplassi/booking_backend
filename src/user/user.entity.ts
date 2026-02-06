
import { Hospital } from 'src/hospital/hospital.entity';
import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, Unique, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

// progile table
@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true,
        nullable: false
    })
    email: string;

    @Column()
    username?: string;

    @Column({ nullable: true })
    avatar_url: string;

    //     ❌ No auth_providers column exists in users table
    // ✅ It is a virtual property used by TypeORM
    // 🔑 IMPORTANT RELATION
    @OneToMany(() => UserAuth, (auth) => auth.user)
    authProviders: UserAuth[];

    // one owner can have many hospitals
    @OneToMany(
        () => Hospital,
        (hospital) => hospital.owner
    )
    hospitals: Hospital[]

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
}


@Entity('user_auth')
@Unique(['providerType', 'providerId']) // here the combination of the cols must be unique across rows 
@Unique(['user', 'providerType'])
export class UserAuth {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.authProviders, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'provider_type', type: 'text' })
    providerType: string; // 'google', 'local', 'github'

    @Column({ name: 'provider_id', type: 'text', nullable: true })
    providerId: string | null; // Google `sub`, GitHub id, etc.

    @Column({ type: 'text', nullable: true })
    credential: string | null; // hashed password (null for OAuth)

    @Column({ name: 'provider_metadata', type: 'jsonb', nullable: true })
    providerMetadata: Record<string, any> | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}



// CREATE TABLE user_auth (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     provider_type TEXT NOT NULL, -- 'google', 'local', 'github', etc.
//     provider_id TEXT,            -- This is the 'sub' from Google
//     credential TEXT,             -- This is the Hashed Password (NULL for Google)
//     provider_metadata JSONB,     -- To store raw Google profile data if needed
//     UNIQUE(provider_type, provider_id), -- Prevents duplicate google IDs
//     UNIQUE(user_id, provider_type)      -- Prevents 1 user having 2 google accounts
// );
