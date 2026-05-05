import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private buildAuthResponse(user: User) {
    const token = this.jwtService.sign({ id: user.id, role: user.role });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async register(name: string, email: string, password: string) {
    // Перевіряємо чи email вже існує
    const existing = await this.usersRepo.findOneBy({ email });
    if (existing) throw new ConflictException('Este email ya está en uso');

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({ name, email, passwordHash });
    await this.usersRepo.save(user);

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) throw new UnauthorizedException('No coincide email o contraseña');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('No coincide email o contraseña');

    return this.buildAuthResponse(user);
  }
}
