import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import bannerFreteMobile from "@/assets/banner-frete-gratis-mobile.webp";
import bannerFreteBrasil from "@/assets/banner-frete-gratis-brasil.webp";


export function Newsletter() {
  return (
    <>
    <div className="w-full">
      <img 
        src={bannerFreteBrasil} 
        alt="Frete grátis para todo o Brasil" 
        className="hidden md:block w-full h-auto" 
        loading="lazy" 
        width="1920" 
        height="150" 
      />
      <img 
        src={bannerFreteMobile} 
        alt="Frete grátis para todo o Brasil" 
        className="block md:hidden w-full h-auto" 
        loading="lazy" 
      />
    </div>
    <section className="bg-neutral-200 text-black border-b border-black/10">
      <div className="container px-4 mx-auto py-5 md:py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div>
              <h3 className="tracking-tighter text-base md:text-2xl text-black">Fique por dentro das</h3>
              <p className="font-black tracking-tighter text-base md:text-2xl text-safety-orange md:text-industrial-blue">melhores ofertas!</p>
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col md:flex-row w-full md:w-auto gap-3 md:gap-5 md:min-w-[420px]"
          >
            <Input
              type="email"
              placeholder="Digite seu e-mail"
              className="bg-white border border-neutral-300 h-10 md:h-11 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-safety-orange"
            />
            <Button className="bg-safety-orange hover:bg-safety-orange/90 text-white font-black tracking-widest text-[0.625rem] md:text-xs h-10 md:h-11 px-6">
              QUERO ME CADASTRAR
            </Button>
          </form>
        </div>
      </div>
    </section>
    </>
  );
}
