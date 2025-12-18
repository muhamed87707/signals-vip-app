'use client';

import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

export default function LegalPage() {
    const { lang, t, isRTL } = useLanguage();

    const content = {
        en: {
            title: 'Legal Documents',
            lastUpdated: 'Last Updated: December 2024',
            sections: [
                {
                    id: 'risk',
                    title: 'Risk Disclaimer',
                    text: `Trading Forex, Commodities, Indices, and other financial instruments involves a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you.
                    
To the maximum extent permitted by applicable law, we disclaim any liability for any loss or damage (including without limitation to, any direct, indirect, or consequential loss and/or loss of profit) which may arise directly or indirectly from the use of or reliance on the signals or information provided.
                    
Past performance of any trading system or methodology is not necessarily indicative of future results.`
                },
                {
                    id: 'advice',
                    title: 'No Financial Advice',
                    text: `The signals, analysis, and information provided by Abu Al-Dahab VIP Signals are for educational and informational purposes only. They should NOT be considered as financial, investment, or trading advice. 
                    
We are not registered financial advisors. You are solely responsible for your own trading decisions and investment strategies.`
                },
                {
                    id: 'privacy',
                    title: 'Privacy Policy',
                    text: `We respect your privacy and are committed to protecting your personal data. 
                    
1. Data Collection: We may collect your Telegram ID and username solely for the purpose of managing your subscription and access to VIP channels.
2. Data Usage: We do not sell, trade, or rent your personal identification information to others.
3. Security: We implement appropriate security measures to protect your data.`
                },
                {
                    id: 'terms',
                    title: 'Terms of Service',
                    text: `By subscribing to our services, you agree to the following terms:
                    
1. Access: VIP access is granted for the duration of your paid subscription.
2. Refunds: Due to the nature of digital goods (information signals), all sales are final and non-refundable once access has been granted.
3. Conduct: Sharing, forwarding, or reselling our VIP signals is strictly prohibited and will result in immediate ban without refund.`
                }
            ]
        },
        ar: {
            title: 'الوثائق القانونية',
            lastUpdated: 'آخر تحديث: ديسمبر 2024',
            sections: [
                {
                    id: 'risk',
                    title: 'إخلاء مسؤولية المخاطر',
                    text: `تداول الفوركس والسلع والمؤشرات ينطوي على مخاطر عالية وقد لا يكون مناسباً لجميع المستثمرين. الرافعة المالية العالية يمكن أن تعمل ضدك كما يمكن أن تعمل لصالحك.
                    
لن نتحمل أي مسؤولية عن أي خسارة أو ضرر (بما في ذلك على سبيل المثال لا الحصر، الخسارة المباشرة أو غير المباشرة أو خسارة الأرباح) التي قد تنشأ بشكل مباشر أو غير مباشر عن استخدام أو الاعتماد على التوصيات أو المعلومات المقدمة.
                    
الأداء السابق لأي نظام تداول ليس بالضرورة مؤشراً على النتائج المستقبلية.`
                },
                {
                    id: 'advice',
                    title: 'لست نصيحة مالية',
                    text: `التوصيات والتحليلات والمعلومات المقدمة من "أبو الذهب" هي لأغراض تعليمية وإعلامية فقط. لا ينبغي اعتبارها نصيحة مالية أو استثمارية أو تجارية.
                    
نحن لسنا مستشارين ماليين مسجلين. أنت وحدك المسؤول عن قراراتك التجارية واستراتيجيات الاستثمار الخاصة بك.`
                },
                {
                    id: 'privacy',
                    title: 'سياسة الخصوصية',
                    text: `نحن نحترم خصوصيتك وملتزمون بحماية بياناتك الشخصية.
                    
1. جمع البيانات: قد نقوم بجمع معرف تليجرام واسم المستخدم الخاص بك فقط لغرض إدارة اشتراكك والوصول إلى قنوات VIP.
2. استخدام البيانات: نحن لا نبيع أو نتاجر أو نؤجر معلومات هويتك الشخصية للآخرين.
3. الأمن: نحن نطبق تدابير أمنية مناسبة لحماية بياناتك.`
                },
                {
                    id: 'terms',
                    title: 'شروط الخدمة',
                    text: `بالاشتراك في خدماتنا، فإنك توافق على الشروط التالية:
                    
1. الوصول: يتم منح الوصول إلى VIP لمدة اشتراكك المدفوع.
2. الاسترداد: نظراً لطبيعة السلع الرقمية (معلومات)، فإن جميع المبيعات نهائية وغير قابلة للاسترداد بمجرد منح الوصول.
3. السلوك: يُحظر تماماً مشاركة أو إعادة توجيه أو بيع توصياتنا وسيؤدي ذلك إلى الحظر الفوري دون استرداد الأموال.`
                }
            ]
        }
    };

    const c = content[lang];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
            {/* Header */}
            <header style={{ padding: '2rem 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span className="text-gradient">Abu Al-Dahab</span>
                    </Link>
                </div>
            </header>

            <main className="container" style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: isRTL ? 'right' : 'left' }}>
                    {c.title}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', textAlign: isRTL ? 'right' : 'left' }}>
                    {c.lastUpdated}
                </p>

                <div className="legal-content">
                    {c.sections.map((section) => (
                        <section key={section.id} style={{ marginBottom: '3rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(184, 134, 11, 0.1)' }}>
                            <h2 style={{ color: 'var(--gold-primary)', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: isRTL ? 'right' : 'left' }}>
                                {section.title}
                            </h2>
                            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#e0e0e0', textAlign: isRTL ? 'right' : 'left' }}>
                                {section.text}
                            </div>
                        </section>
                    ))}
                </div>

                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <Link href="/" className="btn-secondary">
                        {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                    </Link>
                </div>
            </main>
        </div>
    );
}
