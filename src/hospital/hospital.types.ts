
export interface HOSPITAL_DATA {
    name: string;
    email: string;
    reg_number: string;
    phone: string;
}
export interface UPDATE_HOSPITAL extends Partial<HOSPITAL_DATA>{
    hospitalId: string
    ownerId?: string
}