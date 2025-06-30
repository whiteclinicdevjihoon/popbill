const express = require("express");
const router = express.Router();
const popbill = require("popbill");

// 서비스 객체 생성
const accountCheckService = popbill.AccountCheckService();
const kakaoService = popbill.KakaoService();
const bankAccountInfoService = popbill.EasyFinBankService();
// 서비스 상태 확인
router.get("/status", async (req, res) => {
  try {
    // 기본 잔액 조회로 서비스 상태 확인
    const corpNum = process.env.POPBILL_CORPNUM || "3743600797";
    const result = await accountCheckService.getBalance(corpNum);

    // 디버깅용 로그
    console.log("Popbill getBalance result:", result);
    console.log("Result type:", typeof result);

    res.json({
      success: true,
      message: "Popbill 서비스가 정상적으로 연결되었습니다",
      balance: result,
      debug: {
        resultType: typeof result,
        resultKeys:
          result && typeof result === "object" ? Object.keys(result) : "N/A",
      },
    });
  } catch (error) {
    console.error("Popbill status check error:", error);
    res.status(500).json({
      success: false,
      error: "Popbill 서비스 연결에 실패했습니다",
      message: error.message,
    });
  }
});

router.get("/bankAccountInfo", async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.query;
    const corpNum = process.env.POPBILL_CORPNUM || "3743600797";
    const userID = process.env.POPBILL_USERID || "kpolice99999";

    if (!bankCode || !accountNumber) {
      return res.status(400).json({
        success: false,
        error: "필수 파라미터 누락",
        message: "은행코드와 계좌번호를 모두 입력해주세요",
      });
    }

    // 콜백 방식으로 호출
    bankAccountInfoService.getBankAccountInfo(
      corpNum,
      bankCode,
      accountNumber,
      userID,
      (result) => {
        console.log("Success result:", result);
        res.json({
          success: true,
          result: result,
        });
      },
      (error) => {
        console.error("Error result:", error);
        res.status(500).json({
          success: false,
          error: "계좌정보 조회에 실패했습니다",
          message: error.message,
        });
      }
    );
  } catch (error) {
    console.error("Popbill bankAccountInfo error:", error);
    res.status(500).json({
      success: false,
      error: "Popbill bankAccountInfo 조회에 실패했습니다",
      message: error.message,
    });
  }
});

// 잔액 조회
router.get("/balance", async (req, res) => {
  try {
    const corpNum = process.env.POPBILL_CORPNUM || "3743600797";
    const balance = await accountCheckService.getBalance(corpNum);
    res.json({
      success: true,
      balance: balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "잔액 조회에 실패했습니다",
      message: error.message,
    });
  }
});

// 예금주 실명조회
// 팝빌 연동회원 사업자번호 등록
router.post("/regist", async (req, res) => {
  try {
    const {
      corpNum,
      corpName,
      ceoName,
      address,
      bizType,
      bizClass,
      contactName,
      contactEmail,
      contactTEL,
      id,
    } = req.body;

    const result = await popbill.registCorpNum({
      CorpNum: corpNum,
      CorpName: corpName,
      CEOName: ceoName,
      Addr: address,
      BizType: bizType,
      BizClass: bizClass,
      ContactName: contactName,
      ContactEmail: contactEmail,
      ContactTEL: contactTEL,
      ID: id,
    });

    res.json({
      success: true,
      message: "연동회원 등록이 완료되었습니다",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "연동회원 등록에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 등록해제
router.delete("/regist/:corpNum", async (req, res) => {
  try {
    const { corpNum } = req.params;
    const result = await popbill.deleteCorpNum(corpNum);

    res.json({
      success: true,
      message: "연동회원 등록해제가 완료되었습니다",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "연동회원 등록해제에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 목록 조회
router.get("/corpNums", async (req, res) => {
  try {
    const result = await popbill.listCorpNum();
    res.json({
      success: true,
      corpNums: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "연동회원 목록 조회에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 정보 조회
router.get("/corpNum/:corpNum", async (req, res) => {
  try {
    const { corpNum } = req.params;
    const result = await popbill.getCorpInfo(corpNum);

    res.json({
      success: true,
      corpInfo: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "연동회원 정보 조회에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 정보 수정
router.put("/corpNum/:corpNum", async (req, res) => {
  try {
    const { corpNum } = req.params;
    const {
      corpName,
      ceoName,
      address,
      bizType,
      bizClass,
      contactName,
      contactEmail,
      contactTEL,
    } = req.body;

    const result = await popbill.updateCorpInfo({
      CorpNum: corpNum,
      CorpName: corpName,
      CEOName: ceoName,
      Addr: address,
      BizType: bizType,
      BizClass: bizClass,
      ContactName: contactName,
      ContactEmail: contactEmail,
      ContactTEL: contactTEL,
    });

    res.json({
      success: true,
      message: "연동회원 정보 수정이 완료되었습니다",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "연동회원 정보 수정에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 담당자 목록 조회
router.get("/corpNum/:corpNum/contacts", async (req, res) => {
  try {
    const { corpNum } = req.params;
    const result = await popbill.listContact(corpNum);

    res.json({
      success: true,
      contacts: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "담당자 목록 조회에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 담당자 등록
router.post("/corpNum/:corpNum/contacts", async (req, res) => {
  try {
    const { corpNum } = req.params;
    const { id, pwd, personName, email, tel, searchRole, mgrYN, state } =
      req.body;

    const result = await popbill.registContact({
      CorpNum: corpNum,
      ID: id,
      PWD: pwd,
      PersonName: personName,
      Email: email,
      TEL: tel,
      SearchRole: searchRole,
      MgrYN: mgrYN,
      State: state,
    });

    res.json({
      success: true,
      message: "담당자 등록이 완료되었습니다",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "담당자 등록에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 담당자 정보 수정
router.put("/corpNum/:corpNum/contacts/:id", async (req, res) => {
  try {
    const { corpNum, id } = req.params;
    const { personName, email, tel, searchRole, mgrYN, state } = req.body;

    const result = await popbill.updateContact({
      CorpNum: corpNum,
      ID: id,
      PersonName: personName,
      Email: email,
      TEL: tel,
      SearchRole: searchRole,
      MgrYN: mgrYN,
      State: state,
    });

    res.json({
      success: true,
      message: "담당자 정보 수정이 완료되었습니다",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "담당자 정보 수정에 실패했습니다",
      message: error.message,
    });
  }
});

// 팝빌 연동회원 사업자번호 담당자 삭제
router.delete("/corpNum/:corpNum/contacts/:id", async (req, res) => {
  try {
    const { corpNum, id } = req.params;
    const result = await popbill.deleteContact(corpNum, id);

    res.json({
      success: true,
      message: "담당자 삭제가 완료되었습니다",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "담당자 삭제에 실패했습니다",
      message: error.message,
    });
  }
});

module.exports = router;
