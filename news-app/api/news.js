// Vercel Serverless Function - Naver News API Proxy
// 환경변수로 API 키를 안전하게 보관하고 프론트엔드에 노출하지 않음

export default async function handler(req, res) {
  // CORS 헤더 (같은 도메인에서만 호출되므로 안전)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const CLIENT_ID = process.env.NAVER_CLIENT_ID;
  const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({
      error: '환경변수가 설정되지 않았습니다. Vercel 대시보드에서 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 추가해주세요.'
    });
  }

  const query = req.query.q || '경제';
  const display = req.query.display || 15;
  const sort = req.query.sort || 'date';

  try {
    const naverUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}`;

    const response = await fetch(naverUrl, {
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `네이버 API 오류: ${response.status}`,
        detail: errorText
      });
    }

    const data = await response.json();

    // 5분 캐시 (Vercel Edge Cache)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: '서버 오류',
      detail: error.message
    });
  }
}
