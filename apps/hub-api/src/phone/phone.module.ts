import { Global, Module } from '@nestjs/common';
import { PhoneHashService } from './phone-hash.service';

@Global()
@Module({
  providers: [PhoneHashService],
  exports: [PhoneHashService],
})
export class PhoneModule {}
