import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcryptjs from "bcryptjs";

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateUserDto } from './dto';

@Injectable()
export class AuthService {

  constructor( 
    @InjectModel( User.name ) 
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      // 1. Encriptar la constaseña
      const { password, ...userData } = createUserDto;
      
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

      // 2. Guardar el usuario
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;

    } catch ( error ) {
      if ( error.code === 11000 ) {
        throw new BadRequestException( `El correo "${ createUserDto.email }" ya existe.` );
      }
      throw new InternalServerErrorException( `Ha ocurrido el error ${ error.code }` );
    }
  }

  async register( registerUserDto: RegisterUserDto ): Promise<LoginResponse> {

    const user = await this.create( registerUserDto );

    return {
      user: user,
      token: this.getJwt({ id: user._id })
    };
  }

  async login( loginDto: LoginDto ): Promise<LoginResponse> {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if ( !user ) {
      throw new UnauthorizedException( 'Credenciales no válidas (email)' );
    }

    if ( !bcryptjs.compareSync( password, user.password )) {
      throw new UnauthorizedException( 'Credenciales no válidas (password)' );
    }

    const { password:_, ...resData } = user.toJSON();

    return {
      user: resData,
      token: this.getJwt({ id: user.id })
    };

  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById( id );
    const { password, ...rest } = user.toJSON();

    return rest;
  }

  async existEmail( email: string ): Promise<boolean> {
    const user = await this.userModel.findOne({ email });

    if ( user ) {
      console.log( 'email encontrado');
      return true;
    }

    console.log( 'email NO encontrado');
    return false;
  }

  // async findUserByEmail( checkEmailDto: CheckEmailDto ): Promise<User> {
  //   const { email } = checkEmailDto;
  //   const user = this.userModel.findOne({ email });
  //   const { password, ...rest } = (await user).toJSON();

  //   return rest;
  // }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwt( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );
    return token;
  }

}
