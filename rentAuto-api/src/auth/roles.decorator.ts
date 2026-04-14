import { SetMetadata } from '@nestjs/common';

// простий декоратор щоб вказувати яка роль потрібна
export const Role = (role: string) => SetMetadata('role', role);
