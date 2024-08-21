import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {

  constructor( 
    @InjectModel( User.name ) 
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      const newUser = new this.userModel( createUserDto );

      // 1. Encriptar la constaseña

      // 2. Guardar el usuario
      return await newUser.save();

      // 3. Generar el JWT

      
    } catch ( error ) {
      if ( error.code === 11000 ) {
        throw new BadRequestException( `${ createUserDto.email } ya existe.` );
      }
      throw new InternalServerErrorException( `Ha ocurrido el error ${ error.code }` );
    }

  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
