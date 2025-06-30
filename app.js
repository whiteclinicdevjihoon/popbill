require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Popbill SDK 초기화
const popbill = require("popbill");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3001"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS 정책에 의해 차단되었습니다"));
      }
    },
    credentials: true,
  })
);

// Body parser 미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Popbill 클라이언트 초기화 (공식 문서 방식)
popbill.config({
  // 링크아이디
  LinkID: process.env.POPBILL_LINKID || "TESTER",

  // 비밀키
  SecretKey:
    process.env.POPBILL_SECRETKEY ||
    "SwWxqU+0TErBXy/9TVjIPEnI0VTUMMSQZtJf3Ed8q3T=",

  // 연동환경 설정, true-테스트, false-운영(Production), (기본값:false)
  IsTest: process.env.POPBILL_IS_TEST === "true" || true,

  // 통신 IP 고정, true-사용, false-미사용, (기본값:true)
  IPRestrictOnOff: true,

  // 팝빌 API 서비스 고정 IP 사용여부, 기본값(false)
  UseStaticIP: false,

  // 로컬시스템 시간 사용여부, true-사용, false-미사용, (기본값:true)
  UseLocalTimeYN: true,

  defaultErrorHandler: function (Error) {
    console.log("Error Occur : [" + Error.code + "] " + Error.message);
  },
});

// API 라우트
app.use("/api", require("./routes/api"));

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "public")));

// 루트 경로 - 테스트 UI 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// 404 에러 핸들링
app.use((req, res) => {
  res.status(404).json({
    error: "API 엔드포인트를 찾을 수 없습니다",
    path: req.path,
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "서버 내부 오류가 발생했습니다",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Popbill API 서버가 http://localhost:${PORT}에서 실행 중입니다`);
  console.log(`환경: ${process.env.NODE_ENV || "development"}`);
});
