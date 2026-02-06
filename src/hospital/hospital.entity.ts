import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("hospital")
export class Hospital {
    @PrimaryGeneratedColumn()
    id: string

    // many hospital can belongs to one owner
    @ManyToOne(
        () => User,
        (user) => user.hospitals,
        { onDelete: "CASCADE"}
    )
    @JoinColumn({ name: "owner_id"})
    owner: User;

    @Column()
    name: string;

    @Column()
    email: string;
    
    @Column()
    phone: number;

    @Column()
    reg_number: string
}

export const sqlQuery = `
    CREATE table hospital(
        id UUID Default gen_randon_uuid() PRIMARY KEY,
        name varchar(225),
        email varchar(100),
        phone BIGINT,
        reg_number varchar(100),

        -- the relation col --
        owner_id UUID NOT NULL

        -- relation defination --
        CONSTRAINT fk_hospital_owner
        FOREIGN KEY (owner_id)
        REFERENCE user(id)
        ON DELETE cascade
    )

    CREATE EXTENTION IF NOT EXISTS "pgcripto";
`
