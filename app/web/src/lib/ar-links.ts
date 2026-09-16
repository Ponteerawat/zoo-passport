// WebAR links for unlocked animal collections.

const AR_LINK_BY_ANIMAL_TYPE: Record<string, string> = {
  lion: "https://mywebar.com/p/Project_2_c9toz5pubb",
  elephant: "https://mywebar.com/p/Project_1_m4zof44vk6",
  giraffe: "https://mywebar.com/p/Project_2_bd8ea5f0ec",
  penguin: "https://mywebar.com/p/Project_0_d1rkybo8q3",
  panda: "https://mywebar.com/p/Project_4_fsuh5vgdi",
  monkey: "https://mywebar.com/p/Project_3_gmetd5s95j",
};

export function getAnimalArLink(animaltype: string): string | null {
  return AR_LINK_BY_ANIMAL_TYPE[animaltype?.toLowerCase()] ?? null;
}
