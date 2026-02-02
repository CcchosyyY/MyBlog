const CATEGORY_KEYWORDS: Record<string, string[]> = {
  dev: [
    '코드', '개발', '프로그래밍', 'API', '버그', 'Next.js', 'React',
    'JavaScript', 'TypeScript', '함수', '변수', '서버', '배포',
    'Git', 'GitHub', '프론트엔드', '백엔드', '데이터베이스', 'SQL',
    'CSS', 'HTML', '컴포넌트', '라이브러리', '프레임워크', 'Node.js',
    'npm', '패키지', '에러', '디버깅', '코딩', '알고리즘'
  ],
  cooking: [
    '요리', '레시피', '맛있', '음식', '재료', '끓이', '볶', '굽',
    '먹', '식당', '맛집', '밥', '국', '반찬', '디저트', '베이킹',
    '케이크', '빵', '파스타', '고기', '야채', '소스', '양념'
  ],
  study: [
    '공부', '학습', '책', '강의', '시험', '영어', '수학', '자격증',
    '독서', '교육', '수업', '학교', '대학', '논문', '연구', '암기',
    '복습', '예습', '문제풀이', '합격', '불합격', '성적'
  ],
  exercise: [
    '운동', '헬스', '러닝', '건강', '다이어트', '근육', '달리기',
    '요가', '필라테스', '수영', '등산', '자전거', '조깅', '스트레칭',
    '웨이트', '체중', '감량', '벌크업', '컨디션', '트레이닝'
  ],
};

export function suggestCategory(content: string): string {
  const lowerContent = content.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.filter((kw) =>
      lowerContent.includes(kw.toLowerCase())
    ).length;
  }

  const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  return topCategory && topCategory[1] > 0 ? topCategory[0] : 'daily';
}
