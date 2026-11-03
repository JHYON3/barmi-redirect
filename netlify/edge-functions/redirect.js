
/*
 * 바르미식품 기존 도메인 리디렉션
 * 스틱왕.com → barmifd.com
 *
 * 기존 CSV 매핑 + 추가 요청 6개 URL 우선 적용
 * 연결된 페이지: HTTP 301
 * 삭제된 페이지: HTTP 410
 */

const NEW_SITE = "https://barmifd.com";

const redirects = {
  // 메인
  "/": "/",
  "/default/": "/main",
  "/default/index.php": "/",
  "/bizdemo38944/index.php": "/",
    
  "/default/temp/index_expand.php": "/main",


  // 회사소개
  "/default/mp1/mp1_sub1.php": "/info",
  "/default/mp1/mp1_sub5.php": "/info",
  "/default/mp1/mp1_sub7.php": "/info",
  "/bizdemo38944/mp1/mp1_sub1.php": "/info",
  "/bizdemo38944/mp1/mp1_sub5.php": "/info",
  "/bizdemo38944/mp1/mp1_sub7.php": "/info",

  // 제조 및 서비스
  "/default/mp2/mp2_sub01.php": "/stick",
  "/default/mp2/mp2_sub02.php": "/stick",
  "/default/mp2/mp2_sub03.php": "/material",
  "/default/mp3/mp3_sub01.php": "/tea-portfolio",
  "/default/mp3/mp3_sub02.php": "/tea-portfolio",
  "/default/mp3/mp3_sub1.php": "/stick-portfolio",
  "/default/mp4/mp4_sub01.php": "/tea-portfolio",
  "/default/mp4/mp4_sub02.php": "/tea",

  "/bizdemo38944/mp2/mp2_sub01.php": "/stick",
  "/bizdemo38944/mp2/mp2_sub02.php": "/stick",
  "/bizdemo38944/mp2/mp2_sub03.php": "/stick",
  "/bizdemo38944/mp3/mp3_sub01.php": "/stick",
  "/bizdemo38944/mp3/mp3_sub02.php": "/stick",
  "/bizdemo38944/mp3/mp3_sub1.php": "/stick-portfolio",
  "/bizdemo38944/mp4/mp4_sub01.php": "/tea-portfolio",
  "/bizdemo38944/mp4/mp4_sub02.php": "/tea",

  // 원물 및 고객센터
  "/default/mp5/mp5_sub01.php": "/material",
  "/default/mp5/mp5_sub02.php": "/material",
  "/default/mp5/mp5_sub1.php": "/notice",
  "/default/mp6/mp6_sub01.php": "/notice",
  "/default/mp6/mp6_sub03.php": "/FAQ",
  "/default/mp6/mp6_sub04.php": "/contact",
  "/default/mp6/mp6_sub1.php": "/contact",

  "/bizdemo38944/mp5/mp5_sub01.php": "/material",
  "/bizdemo38944/mp5/mp5_sub02.php": "/material",
  "/bizdemo38944/mp5/mp5_sub1.php": "/notice",
  "/bizdemo38944/mp5/mp5_sub2.php": "/material",
  "/bizdemo38944/mp5/mp5_sub3.php": "/FAQ",
  "/bizdemo38944/mp6/mp6_sub01.php": "/notice",
  "/bizdemo38944/mp6/mp6_sub03.php": "/FAQ",
  "/bizdemo38944/mp6/mp6_sub04.php": "/contact",
  "/bizdemo38944/mp6/mp6_sub1.php": "/contact"
};

function redirectTo(path) {
  return Response.redirect(NEW_SITE + path, 301);
}

function gone() {
  return new Response(
    "이 페이지는 더 이상 제공되지 않습니다.",
    {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300"
      }
    }
  );
}

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const q = url.searchParams;

  // 기존 도메인의 검색로봇 접근 허용
  if (path === "/robots.txt") {
    return new Response(
      "User-agent: *\nAllow: /\n",
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      }
    );
  }

  // 1. 특정 쇼핑몰 카테고리 → 생산관리
  if (
    path === "/default/mall/mall1.php" &&
    q.get("mode") === "list" &&
    q.get("cate_code") === "CA100005" &&
    q.get("orderby") === "row_price" &&
    (!q.has("topmenu") || q.get("topmenu") === "")
  ) {
    return redirectTo("/production");
  }

  // 2. 쇼핑몰 기본 목록 → 메인
  if (
    path === "/default/mall/mall1.php" &&
    q.get("mode") === "list" &&
    [...q.keys()].every(
      key => key === "mode"
    )
  ) {
    return redirectTo("/main");
  }

  // 3. 기존 회사소개 특정 페이지 → 메인
  if (
    path === "/default/mp1/mp1_sub5.php" &&
    q.get("sub") === "05"
  ) {
    return redirectTo("/main");
  }

  // 4. 특정 게시판 상세글 → 티백 제조
  if (
    path === "/bizdemo38944/mp3/mp3_sub1.php" &&
    q.get("com_board_basic") === "read_form" &&
    q.get("sub") === "01" &&
    q.get("com_board_id") === "11" &&
    q.get("com_board_idx") === "4"
  ) {
    return redirectTo("/tea");
  }

  // 대체 페이지가 없는 게시판 상세글
  if (
    path === "/bizdemo38944/mp3/mp3_sub1.php" &&
    q.get("com_board_basic") === "read_form"
  ) {
    return gone();
  }

  if (
    path === "/bizdemo38944/mp5/mp5_sub2.php" &&
    q.get("com_board_basic") === "read_form"
  ) {
    return gone();
  }

  // 기존 게시판 글쓰기 화면
  if (
    path.endsWith("/mp6/mp6_sub04.php") &&
    q.get("com_board_basic") === "write_form"
  ) {
    return gone();
  }

  // 기존 CSV의 페이지별 301 매핑
  if (
    Object.prototype.hasOwnProperty.call(
      redirects,
      path
    )
  ) {
    return redirectTo(redirects[path]);
  }

  // 신규 대응 페이지가 없는 주소
  return gone();
}

// Netlify Edge Function 경로 설정
export const config = {
  path: "/*"
};
