/**
 * 누적 학습 시간(분)을 단계로 변환
 *
 * 0: 안함
 * 1: 20~40분
 * 2: 41~90분
 * 3: 91~180분
 * 4: 181분 이상
 */
export function getStudyLevel(totalMinutes: number): number {
  if (totalMinutes >= 181) return 4;
  if (totalMinutes >= 91) return 3;
  if (totalMinutes >= 41) return 2;
  if (totalMinutes >= 20) return 1;
  return 0;
}
