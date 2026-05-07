import type { AnimalProfile } from '../api/users';
import alphacaImg from '../pages/SignupPage/asset/alphacaImg.png';
import bearImg from '../pages/SignupPage/asset/bearImg.png';
import capibaraImg from '../pages/SignupPage/asset/capibaraImg.png';
import catImg from '../pages/SignupPage/asset/catImg.png';
import deerImg from '../pages/SignupPage/asset/deerImg.png';
import dogImg from '../pages/SignupPage/asset/dogImg.png';
import foxImg from '../pages/SignupPage/asset/foxImg.png';
import hamsterImg from '../pages/SignupPage/asset/hamsterImg.png';
import namuneulboImg from '../pages/SignupPage/asset/namuneulboImg.png';
import rabbitImg from '../pages/SignupPage/asset/rabbitImg.png';
import sudalImg from '../pages/SignupPage/asset/sudalImg.png';
import wolfImg from '../pages/SignupPage/asset/wolfImg.png';

export const ANIMAL_OPTIONS: { profile: AnimalProfile; name: string; image: string }[] = [
  { profile: 'DOG',     name: '강아지',   image: dogImg },
  { profile: 'CAT',     name: '고양이',   image: catImg },
  { profile: 'BEAR',    name: '곰',       image: bearImg },
  { profile: 'SLOTH',   name: '나무늘보', image: namuneulboImg },
  { profile: 'HAMSTER', name: '햄스터',   image: hamsterImg },
  { profile: 'WOLF',    name: '늑대',     image: wolfImg },
  { profile: 'RABBIT',  name: '토끼',     image: rabbitImg },
  { profile: 'DEER',    name: '사슴',     image: deerImg },
  { profile: 'OTTER',   name: '수달',     image: sudalImg },
  { profile: 'ALPACA',  name: '알파카',   image: alphacaImg },
  { profile: 'FOX',     name: '여우',     image: foxImg },
  { profile: 'CAPYBARA',name: '카피바라', image: capibaraImg },
];

export const animalProfileImageMap: Record<AnimalProfile, string> = Object.fromEntries(
  ANIMAL_OPTIONS.map((a) => [a.profile, a.image])
) as Record<AnimalProfile, string>;

export const animalImageMap: Record<string, string> = Object.fromEntries(
  ANIMAL_OPTIONS.map((a) => [a.name, a.image])
);

export const animalNameByProfile: Record<AnimalProfile, string> = Object.fromEntries(
  ANIMAL_OPTIONS.map((a) => [a.profile, a.name])
) as Record<AnimalProfile, string>;

export const animalProfileByName: Record<string, AnimalProfile> = Object.fromEntries(
  ANIMAL_OPTIONS.map((a) => [a.name, a.profile])
);