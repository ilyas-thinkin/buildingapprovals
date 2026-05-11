import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import AuthoritiesSection from './components/AuthoritiesSection';
import WhyUsSection from './components/WhyUsSection';
import StandoutSection from './components/StandoutSection';
import FAQSection from './components/FAQSection';
import { homepageFaqs } from '@/lib/homepage-faqs';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: homepageFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroSection />
      <ServicesSection />
      <AuthoritiesSection />
      <WhyUsSection />
      <StandoutSection />
      <FAQSection />
    </>
  );
}
