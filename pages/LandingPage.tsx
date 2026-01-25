
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, ArrowRight, Play, X, Check, Video, 
  Image as ImageIcon, ChartNoAxesColumnIncreasing, 
  Globe, Zap, ShieldCheck, Star, Menu, 
  CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/Accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const navLinks = [
    { label: 'Como Funciona', href: '#funciona' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Planos', href: '#precos' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-primary/30 font-sans scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f0f12]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary size-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="text-white size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Dark Flow AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium text-slate-400 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Login
                </button>
                <Button onClick={handleCTA} size="sm">Começar Agora</Button>
              </>
            ) : (
              <Button onClick={() => navigate('/dashboard')} size="sm">Ir para o Painel</Button>
            )}
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-[#1e1e24] border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-slate-300"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-white/5" />
            <Button onClick={handleCTA} fullWidth>Começar Agora</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#8655f615,transparent_50%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-6 border-primary/50 text-primary bg-primary/10 px-4 py-1.5 rounded-full">
            A Revolução dos Canais Dark
          </Badge>
          <h1 className="text-4xl md:text-7xl font-bold font-display leading-tight mb-6 max-w-5xl mx-auto tracking-tight">
            Crie Canais Dark em <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Piloto Automático</span> e Domine o YouTube
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            A Primeira IA Brasileira que transforma ideias em vídeos virais completos. 
            <span className="text-white block font-semibold mt-2">Roteiros + Thumbnails + SEO Otimizado — Tudo em 1 Clique.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleCTA} className="h-14 px-8 text-lg shadow-[0_0_20px_rgba(134,85,246,0.4)]">
              Começar Agora <ArrowRight className="ml-2 size-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5">
              Ver Demonstração <Play className="ml-2 size-4 fill-current" />
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="diferenciais" className="py-24 bg-black/20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 font-display">
              Pare de perder horas <br />
              <span className="text-red-400">criando conteúdo manualmente</span>
            </h2>
            <div className="space-y-4">
              {[
                "Passar horas escrevendo roteiros que não convertem",
                "Criar thumbnails genéricas que ninguém clica",
                "Perder visualizações por SEO mal otimizado",
                "Ficar preso a um único idioma enquanto o mundo consome",
                "Ver canais menores crescerem mais rápido que o seu"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/5">
                  <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
            <div className="relative bg-[#1e1e24] border border-white/10 p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="size-6 text-primary" /> Você está no lugar certo
              </h3>
              <p className="text-slate-400 mb-6 text-lg">Dark Flow AI é a ferramenta definitiva para criadores que querem escalar sem limites.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-xl text-center border border-white/5">
                  <span className="block text-3xl font-bold text-primary">60s</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Para criar um vídeo</span>
                </div>
                <div className="bg-black/40 p-4 rounded-xl text-center border border-white/5">
                  <span className="block text-3xl font-bold text-primary">5</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Idiomas Nativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funciona" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">O que a IA faz por você?</h2>
            <p className="text-lg text-slate-400">Uma suite completa de ferramentas treinada especificamente para canais Dark.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Video className="text-primary" />, title: "Roteiros Virais", desc: "Estruturados com storytelling e CTAs que prendem a atenção." },
              { icon: <ImageIcon className="text-primary" />, title: "Thumbnails 4K", desc: "Designs profissionais que geram CTR acima de 10% instantaneamente." },
              { icon: <ChartNoAxesColumnIncreasing className="text-primary" />, title: "SEO Otimizado", desc: "Títulos e descrições que rankeiam no topo das buscas." },
              { icon: <Globe className="text-primary" />, title: "5 Idiomas", desc: "Português, Inglês, Espanhol, Italiano e Alemão automáticos." }
            ].map((f, i) => (
              <Card key={i} className="bg-[#1e1e24]/50 border-white/10 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4 p-3 bg-primary/10 w-fit rounded-lg">{f.icon}</div>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white/[0.02] px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-16">Como Funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: "01", title: "Escolha o Nicho", desc: "Espiritualidade, Business, Curiosidades..." },
              { step: "02", title: "Insira a Ideia", desc: "Ou deixe a IA gerar tópicos virais para você" },
              { step: "03", title: "Geração Mágica", desc: "Receba roteiro, thumb e SEO em segundos" },
              { step: "04", title: "Lucro", desc: "Publique e comece a monetizar globalmente" }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="size-16 rounded-2xl bg-[#1e1e24] border border-white/10 flex items-center justify-center text-2xl font-bold text-primary mb-6 shadow-lg shadow-primary/10">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After Table */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">Antes vs Depois</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-2 divide-x divide-white/10">
              <div className="p-6 bg-white/5 text-center font-bold text-red-400 uppercase tracking-widest text-xs">Manual (Antes)</div>
              <div className="p-6 bg-primary/20 text-center font-bold text-primary uppercase tracking-widest text-xs">Dark Flow AI (Depois)</div>
              
              {[
                ["4h por roteiro", "60 segundos"],
                ["R$ 100 por thumbnail", "Incluído no plano"],
                ["SEO genérico", "SEO otimizado com IA"],
                ["1 idioma limitado", "5 idiomas globais"],
                ["Bloqueio criativo", "Ideias infinitas"]
              ].map(([before, after], i) => (
                <React.Fragment key={i}>
                  <div className="p-5 text-center text-slate-400 border-b border-white/5 text-sm">{before}</div>
                  <div className="p-5 text-center font-medium border-b border-white/5 text-sm bg-primary/[0.02]">{after}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 relative px-6 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left -z-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 tracking-tight">Escolha Seu Plano</h2>
            <p className="text-slate-400">Comece grátis e escale conforme cresce.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="bg-[#1e1e24]/30 border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>Para testar a ferramenta</CardDescription>
                <div className="mt-4"><span className="text-4xl font-bold">Grátis</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> 5 Roteiros/mês</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Ideação com IA</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Comunidade</li>
                  <li className="flex items-center gap-2 opacity-50"><X className="size-4" /> Sem Thumbnails</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" fullWidth onClick={handleCTA}>Começar Grátis</Button>
              </CardFooter>
            </Card>

            {/* Profissional */}
            <Card className="bg-[#1e1e24] border-primary relative transform lg:-translate-y-4 shadow-[0_0_40px_rgba(134,85,246,0.2)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Mais Popular</div>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Profissional</CardTitle>
                <CardDescription>Para criadores em crescimento</CardDescription>
                <div className="mt-4 flex items-end gap-1"><span className="text-4xl font-bold">R$ 49</span><span className="text-slate-500 mb-1 text-sm">/mês</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-2"><Zap className="size-4 text-primary" /> 500 Roteiros/mês</li>
                  <li className="flex items-center gap-2"><Zap className="size-4 text-primary" /> 50 Thumbnails 4K</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> SEO Automático</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Suporte Prioritário</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button fullWidth onClick={handleCTA} className="h-12 text-lg">Assinar Agora</Button>
              </CardFooter>
            </Card>

            {/* Agência */}
            <Card className="bg-[#1e1e24]/30 border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Agência</CardTitle>
                <CardDescription>Para escalar múltiplos canais</CardDescription>
                <div className="mt-4 flex items-end gap-1"><span className="text-4xl font-bold">R$ 99</span><span className="text-slate-500 mb-1 text-sm">/mês</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> 1000 Roteiros/mês</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> 100 Thumbnails 4K</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Gestão de Equipe</li>
                  <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Suporte VIP</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" fullWidth onClick={handleCTA}>Assinar Agency</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Bonus Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-primary/5 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">Oferta Limitada</Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-display">Bônus Exclusivos</h2>
            <p className="text-slate-400 mt-2">Disponível apenas para quem assinar hoje.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Comunidade VIP", value: "R$ 97/mês", desc: "Networking com os maiores players do mercado dark." },
              { title: "Pack 30 Thumbnails", value: "R$ 197", desc: "Templates editáveis de alta conversão." },
              { title: "Guia Monetização", value: "R$ 147", desc: "Estratégias avançadas para monetizar rápido." },
              { title: "Suporte Prioritário", value: "R$ 97", desc: "Atendimento exclusivo nos primeiros 30 dias." }
            ].map((b, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl border border-white/10 bg-[#1e1e24]/60 backdrop-blur-sm">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Star className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{b.title}</h3>
                  <div className="text-xs font-bold text-green-400 mb-1">Valor: {b.value}</div>
                  <p className="text-sm text-slate-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center p-8 rounded-2xl bg-primary/10 border border-primary/20 max-w-2xl mx-auto">
            <p className="text-xl font-bold mb-2">Valor Total dos Bônus: <span className="text-primary line-through decoration-red-500">R$ 538</span></p>
            <p className="text-slate-300">Seu investimento hoje: <strong className="text-white">A partir de R$ 49/mês</strong></p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display mb-16">O que dizem os criadores</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Carlos M.", role: "Canal de Espiritualidade", quote: "Passei de 500 views para 50k em 2 semanas. Meu RPM nunca foi tão alto!" },
              { name: "Mariana P.", role: "Agência Digital", quote: "Criei 5 canais em idiomas diferentes e todos monetizaram em menos de 60 dias." },
              { name: "Rafael S.", role: "Criador Dark", quote: "Antes pagava R$ 200 por roteiro. Agora crio 500 por mês com um clique!" }
            ].map((t, i) => (
              <Card key={i} className="bg-[#1e1e24]/40 border-white/5 text-left h-full">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="size-4 text-yellow-500" />)}
                  </div>
                  <p className="text-lg italic text-slate-300 mb-6 leading-relaxed">"{t.quote}"</p>
                </CardHeader>
                <CardFooter className="flex flex-col items-start border-t border-white/5 pt-6">
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold font-display text-center mb-12">Perguntas Frequentes</h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "Funciona para iniciantes?", a: "Sim! A interface é intuitiva e a IA faz 95% do trabalho pesado por você." },
            { q: "Preciso de conhecimento técnico?", a: "Zero. Se você sabe clicar em um botão, você consegue usar o Dark Flow AI." },
            { q: "Posso cancelar quando quiser?", a: "Sim, sem multa ou burocracia. Você está no controle total da sua assinatura." },
            { q: "E se eu não gostar?", a: "Oferecemos garantia incondicional de 7 dias. Não gostou? Devolvemos 100% do seu dinheiro." }
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
              <AccordionTrigger className="text-left text-lg hover:text-primary">{item.q}</AccordionTrigger>
              <AccordionContent className="text-slate-400 text-base">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center bg-gradient-to-t from-primary/10 to-transparent px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-8">Domine o YouTube em <br /> <span className="text-primary italic">Escala Global</span></h2>
          <p className="text-xl text-slate-400 mb-12">Não deixe para amanhã o canal que pode mudar sua vida hoje.</p>
          <Button size="xl" onClick={handleCTA} className="h-16 px-12 text-xl rounded-full shadow-glow">
            Garanta Sua Vaga
          </Button>
          <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="size-4 text-green-400" /> Garantia de 7 dias ou seu dinheiro de volta
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="size-5 text-primary" />
            <span className="font-bold text-white">Dark Flow AI</span>
          </div>
          <p className="mb-4">A IA que Criadores Sérios Usam para Dominar o YouTube</p>
          <p className="text-[10px] uppercase tracking-widest opacity-30">MARKETAI SOLUÇÕES LTDA - CNPJ: XX.XXX.XXX/0001-XX</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
