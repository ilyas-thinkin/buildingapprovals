import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import AuthoritiesSection from './components/AuthoritiesSection';
import WhyUsSection from './components/WhyUsSection';
import StandoutSection from './components/StandoutSection';
import FAQSection from './components/FAQSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AuthoritiesSection />
      <WhyUsSection />
      <StandoutSection />
      <FAQSection />
    </>
  );
}
