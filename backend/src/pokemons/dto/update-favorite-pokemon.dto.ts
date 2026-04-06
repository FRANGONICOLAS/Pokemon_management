import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFavoritePokemonDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}
