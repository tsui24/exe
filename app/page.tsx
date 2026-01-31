import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/spline-scene";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { SparklesCore } from "@/components/ui/sparkles";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Navbar } from "@/components/ui/navbar";
import { Pricing } from "@/components/ui/pricing";
import {
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Bot,
  Workflow,
  Brain,
  MessageSquare,
  Cog,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Component */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="container mx-auto px-4">
          <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-none">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />

            <div className="flex h-full">
              {/* Left content */}
              <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text">
                  AI Thông Minh Cho Ngành Xây Dựng Việt Nam
                </h1>
                <p className="mt-4 text-neutral-300 max-w-lg">
                  Chúng tôi giúp doanh nghiệp xây dựng tự động hóa quy trình
                  kiểm tra tuân thủ, tra cứu tiêu chuẩn TCVN/QCVN và phân tích
                  tài liệu kỹ thuật 24/7 với AI Agent thông minh.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-gray-100 w-full sm:w-auto"
                    >
                      Dùng Thử Miễn Phí
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-transparent w-full sm:w-auto"
                    >
                      Xem Demo Trực Tiếp
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-8 text-sm text-neutral-400 mt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Hỗ Trợ Tiếng Việt 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Cập Nhật Tiêu Chuẩn Mới Nhất</span>
                  </div>
                </div>
              </div>

              {/* Right content */}
              <div className="flex-1 relative">
                <SplineScene
                  scene="https://prod.spline.design/UbM7F-HZcyTbZ4y3/scene.splinecode"
                  className="w-full h-full"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Vẫn Đang Tra Cứu Tiêu Chuẩn Thủ Công?
              </h2>
              <div className="space-y-4 text-gray-300">
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  Mất hàng giờ tra cứu TCVN, QCVN trong đống tài liệu dày
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  Khó khăn kiểm tra tuân thủ phòng cháy chữa cháy và kết cấu
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  Lo lắng sai sót trong hồ sơ xin giấy phép xây dựng
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  Không kịp cập nhật các quy chuẩn xây dựng mới nhất
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">
                AI Agent Chuyên Ngành Xây Dựng Việt Nam
              </h3>
              <div className="space-y-4 text-gray-300">
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Hỏi đáp AI về tiêu chuẩn TCVN, QCVN tức thì với độ chính xác
                  99%
                </p>
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Phân tích tài liệu thiết kế và tạo báo cáo tuân thủ tự động
                </p>
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Kho 1000+ tài liệu xây dựng được chuẩn hóa sẵn sàng tra cứu
                </p>
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  Tiết kiệm 20+ giờ/tuần trong công việc kiểm tra và tra cứu
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Tính Năng AI Cho Xây Dựng
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Giải pháp AI toàn diện được thiết kế riêng cho ngành xây dựng Việt
              Nam
            </p>
          </div>

          <BentoGrid className="lg:grid-rows-3">
            <BentoCard
              name="Hỏi Đáp AI Thông Minh"
              className="lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
              background={
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm border border-white/10" />
              }
              Icon={Bot}
              description="Trợ lý AI chuyên biệt trả lời mọi thắc mắc về tiêu chuẩn TCVN, QCVN, quy định phòng cháy chữa cháy và yêu cầu kết cấu 24/7 bằng tiếng Việt."
              href="#"
              cta="Tìm hiểu thêm"
            />
            <BentoCard
              name="Phân Tích Tài Liệu Tự Động"
              className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
              background={
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm border border-white/10" />
              }
              Icon={Workflow}
              description="Tải lên bản vẽ thiết kế, hồ sơ kỹ thuật và nhận báo cáo tuân thủ chi tiết với phân tích rủi ro toàn diện trong vài phút."
              href="#"
              cta="Tìm hiểu thêm"
            />
            <BentoCard
              name="Kho Tiêu Chuẩn TCVN/QCVN"
              className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
              background={
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm border border-white/10" />
              }
              Icon={Cog}
              description="Truy cập kho 1000+ tài liệu xây dựng được chuẩn hóa: TCVN, QCVN, quy chuẩn phòng cháy, yêu cầu kết cấu và giấy phép."
              href="#"
              cta="Tìm hiểu thêm"
            />
            <BentoCard
              name="Kiểm Tra Tuân Thủ Pháp Lý"
              className="lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2"
              background={
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm border border-white/10" />
              }
              Icon={Brain}
              description="Phân tích tự động độ tuân thủ của dự án theo quy chuẩn xây dựng hiện hành và cả báo về rủi ro pháp lý."
              href="#"
              cta="Tìm hiểu thêm"
            />
            <BentoCard
              name="Báo Cáo Chuyên Nghiệp"
              className="lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4"
              background={
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm border border-white/10" />
              }
              Icon={MessageSquare}
              description="Xuất báo cáo tuân thủ dạng PDF chuyên nghiệp với danh sách kiểm tra chi tiết, đánh giá rủi ro và khuyến nghị khắc phục."
              href="#"
              cta="Tìm hiểu thêm"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Được Tin Dùng Bởi Các Doanh Nghiệp Xây Dựng
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/80 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  <p className="text-gray-300">
                    &quot;AI Agent giúp chúng tôi tiết kiệm 70% thời gian tra
                    cứu tiêu chuẩn. Kiểm tra tuân thủ tự động giúp phát hiện sai
                    sót trước khi nộp hồ sơ.&quot;
                  </p>
                  <div>
                    <p className="font-semibold text-white">Nguyễn Văn A</p>
                    <p className="text-sm text-gray-400">
                      Giám Đốc, Công ty TNHH Xây Dựng Hoàng Gia
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  <p className="text-gray-300">
                    &quot;Phân tích tài liệu tự động giúp tôi kiểm tra tuân thủ
                    nhanh hơn 10 lần. Báo cáo PDF chi tiết rất chuyên nghiệp để
                    trình khách hàng.&quot;
                  </p>
                  <div>
                    <p className="font-semibold text-white">Trần Thị B</p>
                    <p className="text-sm text-gray-400">
                      Kỹ Sư Trưởng, Việt An Construction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  <p className="text-gray-300">
                    &quot;Kho tiêu chuẩn TCVN/QCVN đầy đủ và luôn cập nhật. Hỏi
                    đáp AI giúp nhân viên mới tiếp cận chuẩn xây dựng nhanh
                    chóng.&quot;
                  </p>
                  <div>
                    <p className="font-semibold text-white">Lê Minh C</p>
                    <p className="text-sm text-gray-400">
                      Giám Đốc Dự Án, Nam Tiến Group
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Hiệu Quả Thực Tế Đo Lường Được
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Khách hàng của chúng tôi thấy kết quả ngay lập tức
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">70%</h3>
              <p className="text-gray-300">Tiết Kiệm Thời Gian Tra Cứu</p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-blue-900/40 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">99%</h3>
              <p className="text-gray-300">Độ Chính Xác Trong Phân Tích</p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-purple-900/40 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">1000+</h3>
              <p className="text-gray-300">Tài Liệu Xây Dựng Chuẩn Hóa</p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-orange-900/40 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">24/7</h3>
              <p className="text-gray-300">Hỗ Trợ AI Tiếng Việt</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-black">
        <Pricing
          title="Chọn Gói AI Phù Hợp Cho Bạn"
          description="Giá linh hoạt theo quy mô doanh nghiệp\nTất cả gói bao gồm thiết lập, đào tạo và bảo hành 30 ngày"
          plans={[
            {
              name: "Cơ Bản",
              price: "299",
              yearlyPrice: "249",
              period: "tháng",
              features: [
                "Hỏi đáp AI không giới hạn",
                "Truy cập kho kiến thức TCVN/QCVN",
                "Quy định phòng cháy chữa cháy",
                "Hướng dẫn yêu cầu kết cấu",
                "Hỗ trợ email",
                "Bảo hành 30 ngày",
              ],
              description: "Hoàn hảo cho kỹ sư và doanh nghiệp nhỏ",
              buttonText: "Dùng Thử Miễn Phí",
              href: "#contact",
              isPopular: false,
            },
            {
              name: "Chuyên Nghiệp",
              price: "499",
              yearlyPrice: "449",
              period: "tháng",
              features: [
                "Tất cả tính năng gói Cơ Bản",
                "Tải lên & phân tích tài liệu",
                "Báo cáo rủi ro tuân thủ chi tiết",
                "Quản lý tất cả tài liệu",
                "Ưu tiên phản hồi AI",
                "Xuất báo cáo PDF chuyên nghiệp",
                "Hỗ trợ ưu tiên 24/7",
                "Cập nhật tiêu chuẩn hàng tháng",
              ],
              description: "Lý tưởng cho công ty xây dựng vừa và lớn",
              buttonText: "Bắt Đầu Ngay",
              href: "#contact",
              isPopular: true,
            },
            {
              name: "Doanh Nghiệp",
              price: "Liên hệ",
              yearlyPrice: "Liên hệ",
              period: "",
              features: [
                "Tất cả tính năng gói Chuyên Nghiệp",
                "Tích hợp API tùy chỉnh",
                "AI model riêng cho doanh nghiệp",
                "Chuyên gia AI chuyên trách",
                "Hỗ trợ uu tiên 24/7",
                "Bảo mật và tuân thủ nâng cao",
                "Giải pháp white-label",
                "Đào tạo nhân viên toàn diện",
                "Đánh giá hiệu quả hàng quý",
              ],
              description: "Chuyển đổi AI toàn diện cho tập đoàn lớn",
              buttonText: "Liên Hệ Tư Vấn",
              href: "#contact",
              isPopular: false,
            },
          ]}
        />
      </section>

      {/* Process Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              3 Bước Đơn Giản Để Bắt Đầu
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Từ tư vấn đến triển khai, chúng tôi làm mọi thứ trở nên dễ dàng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="h-20 w-20 bg-white text-black rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-white">Đăng Ký Dùng Thử</h3>
              <p className="text-gray-300">
                Tạo tài khoản miễn phí và trải nghiệm ngay các tính năng hỏi đáp
                AI và tra cứu tiêu chuẩn
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="h-20 w-20 bg-white text-black rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-white">Tải Tài Liệu Lên</h3>
              <p className="text-gray-300">
                Upload bản vẽ thiết kế, hồ sơ kỹ thuật của bạn và AI sẽ phân
                tích tự động
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="h-20 w-20 bg-white text-black rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-white">Nhận Báo Cáo</h3>
              <p className="text-gray-300">
                Đọn nhận báo cáo tuân thủ chi tiết với đánh giá rủi ro và khuyến
                nghị khắc phục
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <AnimatedGradientBackground
          Breathing={true}
          gradientColors={[
            "#0A0A0A",
            "#2979FF",
            "#FF80AB",
            "#FF6D00",
            "#FFD600",
            "#00E676",
            "#3D5AFE",
          ]}
          gradientStops={[35, 50, 60, 70, 80, 90, 100]}
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="relative h-32 w-full flex flex-col items-center justify-center">
              <div className="w-full absolute inset-0">
                <SparklesCore
                  id="ctasparticles"
                  background="transparent"
                  minSize={0.6}
                  maxSize={1.4}
                  particleDensity={100}
                  className="w-full h-full"
                  particleColor="#FFFFFF"
                  speed={0.8}
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 relative z-20 text-balance">
                Sẵn Sàng Đưa AI Vào Dự Án Của Bạn?
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-black hover:bg-gray-100 w-full sm:w-auto"
                >
                  Dùng Thử Miễn Phí Ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent w-full sm:w-auto"
                >
                  Liên Hệ Tư Vấn
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="relative py-20 bg-black border-t border-white/10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/90" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  ConstructionIQ
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Giải pháp AI thông minh cho ngành xây dựng Việt Nam, giúp
                  doanh nghiệp tiết kiệm thời gian và đảm bảo tuân thủ.
                </p>
              </div>

              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Tính Năng</h4>
              <ul className="space-y-3">
                {[
                  "Hỏi Đáp AI Thông Minh",
                  "Phân Tích Tài Liệu Tự Động",
                  "Kho Tiêu Chuẩn TCVN/QCVN",
                  "Kiểm Tra Tuân Thủ Pháp Lý",
                  "Báo Cáo Chuyên Nghiệp",
                ].map((service) => (
                  <li key={service}>
                    <a
                      href="#services"
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Công Ty</h4>
              <ul className="space-y-3">
                {[
                  { name: "Về Chúng Tôi", href: "#" },
                  { name: "Khách Hàng", href: "#testimonials" },
                  { name: "Blog", href: "#" },
                  { name: "Tuyển Dụng", href: "#" },
                  { name: "Liên Hệ", href: "#contact" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-white">Liên Hệ</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <a
                    href="mailto:contructIQ.work@gmail.com"
                    className="hover:text-white transition-colors duration-300"
                  >
                    contructIQ.work@gmail.com
                  </a>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </div>
                  <a
                    href="tel:+84913620252"
                    className="hover:text-white transition-colors duration-300"
                  >
                    0913 620 252
                  </a>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>Hà Nội, Việt Nam</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 mt-16 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <p className="text-gray-400 text-center lg:text-left">
                © 2026 ConstructionIQ. Tất cả quyền được bảo lưu.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-end space-x-8">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Chính Sách Bảo Mật
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Điều Khoản Sử Dụng
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
