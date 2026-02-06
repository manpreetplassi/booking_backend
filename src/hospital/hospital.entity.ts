import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Hospital {
    @PrimaryGeneratedColumn()
    id: string

    // @Column()
    // owner: 

    @Column()
    name: string;

    @Column()
    email: string;
    
    @Column()
    phone: number;

    @Column()
    reg_number: string
}