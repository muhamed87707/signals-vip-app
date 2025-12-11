'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const telegramLink = "https://t.me/Abou_AlDahab";

  const features = [
    {
      icon: "🎯",
      title: "دقة عالية",
      description: "توصيات مدروسة بعناية مع نسبة نجاح تتجاوز 85%"
    },
    {
      icon: "⚡",
      title: "توصيات فورية",
      description: "إشعارات لحظية عبر تليجرام لكل فرصة تداول"
    },
    {
      icon: "📊",
      title: "تحليل فني متقدم",
      description: "تحليلات يومية شاملة للأسواق والاتجاهات"
    },
    {
      icon: "🛡️",
      title: "إدارة مخاطر",
      description: "نقاط دخول وخروج محددة مع وقف خسارة واضح"
    },
    {
      icon: "💎",
      title: "دعم VIP",
      description: "متابعة شخصية ودعم مباشر على مدار الساعة"
    },
    {
      icon: "📈",
      title: "نتائج موثقة",
      description: "سجل كامل لجميع التوصيات ونتائجها الفعلية"
    }
  ];

  const stats = [
    { number: "500+", label: "متداول نشط" },
    { number: "85%", label: "نسبة النجاح" },
    { number: "3+", label: "سنوات خبرة" },
    { number: "1000+", label: "توصية ناجحة" }
  ];

  const plans = [
    {
      name: "الباقة الأسبوعية",
      price: "25$",
      duration: "أسبوع واحد",
      features: ["توصيات يومية", "تحليل السوق", "دعم عبر التليجرام"],
      popular: false
    },
    {
      name: "الباقة الشهرية",
      price: "75$",
      duration: "شهر كامل",
      features: ["توصيات يومية", "تحليل السوق", "دعم VIP", "جلسات تعليمية"],
      popular: true
    },
    {
      name: "الباقة الفصلية",
      price: "180$",
      duration: "3 أشهر",
      features: ["جميع مميزات الشهرية", "خصم 20%", "أولوية في الدعم", "استشارات خاصة"],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "أحمد محمد",
      role: "متداول منذ 6 أشهر",
      text: "أفضل قناة توصيات جربتها! الدقة عالية جداً والنتائج ممتازة. حققت أرباح ممتازة خلال شهرين فقط.",
      avatar: "👨‍💼"
    },
    {
      name: "سارة علي",
      role: "مشتركة VIP",
      text: "التحليلات الفنية رائعة والدعم سريع جداً. أنصح بها كل من يريد دخول عالم التداول.",
      avatar: "👩‍💼"
    },
    {
      name: "محمد خالد",
      role: "متداول محترف",
      text: "مؤسسة ابو الذهب غيرت طريقة تداولي. التوصيات دقيقة وإدارة المخاطر ممتازة.",
      avatar: "👨‍💻"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            <h1 className="text-xl md:text-2xl font-bold gold-text">مؤسسة ابو الذهب</h1>
          </div>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-button px-4 py-2 md:px-6 md:py-2 rounded-full text-sm md:text-base"
          >
            انضم الآن 🚀
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
        </div>

        <div className={`relative z-10 text-center max-w-4xl mx-auto ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
          <div className="inline-block mb-6 px-4 py-2 bg-[#D4AF37]/20 rounded-full border border-[#D4AF37]/30">
            <span className="text-[#FFD700] text-sm md:text-base">🔥 انضم لأكثر من 500+ متداول ناجح</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            حقق أرباحك مع
            <br />
            <span className="gold-text">مؤسسة ابو الذهب</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            توصيات احترافية لتداول الذهب والفوركس بدقة عالية ونتائج موثقة.
            ابدأ رحلتك نحو الحرية المالية اليوم!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button animate-pulse-gold px-8 py-4 rounded-full text-lg font-bold flex items-center gap-2"
            >
              <span>🚀</span>
              ابدأ الآن مجاناً
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-full text-lg font-bold border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
            >
              عرض الباقات
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> نتائج موثقة
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> دعم على مدار الساعة
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> ضمان استرداد الأموال
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#D4AF37]/50 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-[#D4AF37] rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-[#D4AF37]/20 bg-[#0a0a0a]/50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-5xl font-bold gold-text mb-2">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              لماذا <span className="gold-text">مؤسسة ابو الذهب</span>؟
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              نقدم لك أفضل خدمات التوصيات مع فريق من الخبراء المحترفين
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[#FFD700]">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-transparent to-[#1a1a2e]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              اختر <span className="gold-text">باقتك</span> المناسبة
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              باقات مرنة تناسب جميع المتداولين
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative glass-card rounded-3xl p-8 ${plan.popular ? 'border-2 border-[#D4AF37] scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-4 py-1 rounded-full text-sm font-bold">
                    الأكثر طلباً ⭐
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold gold-text mb-1">{plan.price}</div>
                  <div className="text-gray-500 text-sm">{plan.duration}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#D4AF37]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center py-3 rounded-xl font-bold transition-all ${plan.popular
                      ? 'gold-button'
                      : 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10'
                    }`}
                >
                  اشترك الآن
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ماذا يقول <span className="gold-text">عملاؤنا</span>؟
            </h2>
          </div>

          <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">{testimonials[currentTestimonial].avatar}</div>
            <p className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="text-[#FFD700] font-bold text-lg">{testimonials[currentTestimonial].name}</div>
            <div className="text-gray-500 text-sm">{testimonials[currentTestimonial].role}</div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial ? 'bg-[#D4AF37] w-8' : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            جاهز لبدء رحلة <span className="gold-text">النجاح</span>؟
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            انضم الآن لمؤسسة ابو الذهب وابدأ بتحقيق أرباح حقيقية مع فريق من الخبراء
          </p>
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-button animate-pulse-gold inline-flex items-center gap-3 px-10 py-5 rounded-full text-xl font-bold"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.152-1.359 5.51-.168.574-.336.766-.551.785-.466.042-.82-.308-1.27-.603-.705-.462-1.103-.75-1.787-1.2-.792-.522-.279-.808.173-1.276.118-.123 2.18-1.998 2.22-2.169.005-.021.01-.1-.037-.142-.047-.042-.116-.027-.166-.016-.07.016-1.19.756-3.359 2.22-.318.218-.606.324-.863.318-.284-.006-.831-.16-1.238-.292-.499-.163-.896-.249-.861-.526.018-.144.216-.292.593-.443 2.325-.964 3.876-1.6 4.653-1.906 2.216-.872 2.676-.823 2.975-.78.066.01.213.022.308.138.08.097.102.225.113.315.012.09.026.295-.015.455z" />
            </svg>
            انضم لقناة التليجرام
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-[#D4AF37]/20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-xl font-bold gold-text">مؤسسة ابو الذهب</span>
            </div>

            <div className="flex gap-6 text-gray-500 text-sm">
              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                تليجرام
              </a>
              <span>|</span>
              <span>توصيات احترافية</span>
            </div>

            <div className="text-gray-500 text-sm">
              © 2024 مؤسسة ابو الذهب. جميع الحقوق محفوظة.
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 text-center text-gray-600 text-xs leading-relaxed max-w-3xl mx-auto">
            <p>
              ⚠️ تنويه: التداول في الأسواق المالية ينطوي على مخاطر عالية. الأداء السابق لا يضمن النتائج المستقبلية.
              تأكد من فهمك الكامل للمخاطر قبل الاستثمار.
            </p>
          </div>
        </div>
      </footer>

      {/* Telegram Script */}
      <script src="https://telegram.org/js/telegram-web-app.js" async></script>
    </div>
  );
}