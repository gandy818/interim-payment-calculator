import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 중도금 대출 이자 계산기",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-white">
      <div className="w-full max-w-[720px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-3">
          개인정보처리방침
        </h1>
        <p className="text-[13px] text-gray-500 mb-10">
          시행일: 2026년 9월 8일
        </p>

        <div className="space-y-9 text-[14.5px] leading-[1.85] text-gray-600">
          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">1. 서비스 소개</h2>
            <p>
              중도금 대출 이자 계산기(이하 &ldquo;이 사이트&rdquo;)는 아파트
              분양 등에서 발생하는 회차별 중도금 대출원금과 납부일, 이자율을
              입력하면 기준일까지 쌓이는 대출이자를 단리(單利) 방식으로 계산해
              보여주는 무료 웹 도구입니다. 회원가입이나 로그인 없이 누구나
              이용할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">
              2. 계산기 입력 정보 처리
            </h2>
            <p>
              계산기에 입력하는 대출원금, 납부일, 이자율 등의 정보는 이용자의
              브라우저 안에서만 계산되며, 이 사이트의 서버로 전송되거나 저장되지
              않습니다. 페이지를 새로고침하거나 닫으면 입력한 내용은 모두
              사라집니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">
              3. 자동으로 수집되는 정보
            </h2>
            <p>
              이 사이트는 서비스 운영 및 개선을 위해 접속 기기, 브라우저 종류,
              방문 페이지, 접속 시간과 같은 정보가 서버 로그나 분석·광고
              서비스를 통해 자동으로 수집될 수 있습니다. 이 정보만으로 특정
              개인을 식별하지는 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">
              4. 쿠키 및 광고, 제3자 서비스
            </h2>
            <p>
              이 사이트는 Google AdSense를 비롯한 제3자 광고 서비스를 통해
              광고를 게재할 수 있습니다. Google을 포함한 제3자 공급업체는 쿠키를
              사용해 이용자가 이 사이트 또는 다른 사이트를 방문한 기록을
              바탕으로 맞춤형 광고를 게재할 수 있습니다.
            </p>
            <p className="mt-3">
              Google의 광고 쿠키 사용에 대한 자세한 내용과 맞춤 광고를 해제하는
              방법은{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-gray-900"
              >
                Google 광고 정책 페이지
              </a>
              에서,{" "}
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-gray-900"
              >
                Google 광고 설정
              </a>
              에서 직접 확인하고 관리하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">
              5. 쿠키 제어 방법
            </h2>
            <p>
              이용자는 사용 중인 브라우저의 설정 메뉴에서 쿠키 저장을 거부하거나
              이미 저장된 쿠키를 삭제할 수 있습니다. 다만 쿠키 저장을 거부할
              경우 광고 맞춤화를 포함한 일부 기능이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">
              6. 아동의 개인정보
            </h2>
            <p>
              이 사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동으로부터
              개인정보를 의도적으로 수집하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">
              7. 개인정보처리방침의 변경
            </h2>
            <p>
              법령이나 서비스 정책 변경에 따라 이 방침의 내용이 변경될 수
              있으며, 변경 시 이 페이지를 통해 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] text-gray-900 mb-2">8. 문의</h2>
            <p>
              본 방침이나 이 사이트의 개인정보 처리에 대해 궁금한 점이 있으시면
              사이트 운영자에게 문의해주세요.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
