import { motion } from "framer-motion";
import { FaInstagram, FaFacebook } from "react-icons/fa6";

// Real comedian headshots (from your Excel file)
import andrewRiversImg from "@assets/generated_images/andrew-rivers.jpg";
import caseyMclainImg from "@assets/generated_images/casey-mclain.jpg";
import christianMateoImg from "@assets/generated_images/christian-mateo.jpg";
import derekGladsonImg from "@assets/generated_images/derek-gladson.jpg";
import garettIversonImg from "@assets/generated_images/garrett-iverson.jpg";
import gavinHowellsImg from "@assets/generated_images/gavin-howells.jpg";
import jacobBarberImg from "@assets/generated_images/jacob-barber.jpg";
import jessEverettImg from "@assets/generated_images/jess-everett.jpg";
import karanSharmaImg from "@assets/generated_images/karan-sharma.jpg";
import lukeSevereidImg from "@assets/generated_images/luke-severeid.jpg";
import lynetteManningImg from "@assets/generated_images/lynette-manning.jpg";
import minLinImg from "@assets/generated_images/min-lin.jpg";
import stevenRineImg from "@assets/generated_images/steven-rine.jpg";
import tonyCardozaImg from "@assets/generated_images/tony-cardoza.jpg";
import trentonCottonImg from "@assets/generated_images/trenton-cotton.jpg";
import tylerSmithImg from "@assets/generated_images/tyler-smith.jpg";

type Comedian = {
  name: string;
  image: string;
  instagram?: string;
  facebook?: string;
};

const comedians: Comedian[] = [
  {
    name: "Andrew Rivers",
    image: andrewRiversImg,
    instagram: "https://www.instagram.com/andrewjrivers/",
    facebook: "https://www.facebook.com/andrewriverscomedy",
  },
  {
    name: "Casey McLain",
    image: caseyMclainImg,
    instagram: "https://www.instagram.com/caseymclaincomedy/",
    facebook: "https://www.facebook.com/casey.mclain.5",
  },
    {
    name: "Christian Mateo",
    image: christianMateoImg,
    instagram: "https://www.instagram.com/christianmateo.comedy/",
  },
  {
    name: "Derek Gladson",
    image: derekGladsonImg,
    instagram: "https://www.instagram.com/derekgladsoncomedy/",
    facebook: "https://www.facebook.com/derek.gladson",
  },
    {
    name: "Garrett Iverson",
    image: garettIversonImg,
    instagram: "https://www.instagram.com/garrettiversoncomedy/",
    facebook: "https://www.facebook.com/garrett.iverson.71",
  },
  {
    name: "Gavin Howells",
    image: gavinHowellsImg,
    instagram: "https://www.instagram.com/gavvy.goo/",
    facebook: "https://www.facebook.com/gavin.howells.566602",
  },
    {
    name: "Jacob Barber",
    image: jacobBarberImg,
    instagram: "https://www.instagram.com/jacob_is_a_comedian/",
    facebook: "https://www.facebook.com/jacob.barber.167",
  },
  {
    name: "Jess Everett",
    image: jessEverettImg,
    instagram: "https://www.instagram.com/imjesseverett/",
    facebook: "https://www.facebook.com/jess.everett.758",
  },
  {
    name: "Karan Sharma",
    image: karanSharmaImg,
    instagram: "https://www.instagram.com/karanbhaisharma/",
    facebook: "https://www.facebook.com/sharmakaran",
  },
  {
    name: "Luke Severeid",
    image: lukeSevereidImg,
    instagram: "https://www.instagram.com/lukesevereid/",
    facebook: "https://www.facebook.com/lukesevereidcomedy",
  },
  {
    name: "Lynette Manning",
    image: lynetteManningImg,
    instagram: "https://www.instagram.com/lynettecomedy/",
    facebook: "https://www.facebook.com/lynette.nicolas",
  },
  {
    name: "Min Lin",
    image: minLinImg,
    instagram: "https://www.instagram.com/min_lin_comedy/",
    facebook: "https://www.facebook.com/minlinsunny",
  },
  {
    name: "Steven Rine",
    image: stevenRineImg,
    instagram: "https://www.instagram.com/stevebefuckinup/",
    facebook: "https://www.facebook.com/steven.rine",
  },
  {
    name: "Tony Cardoza",
    image: tonyCardozaImg,
    instagram: "https://www.instagram.com/cardozacomedy/",
    facebook: "https://www.facebook.com/anthony.vincent.90226",
  },
  {
    name: "Trenton Cotton",
    image: trentonCottonImg,
    instagram: "https://www.instagram.com/trentoncottencomedy/",
    facebook: "https://www.facebook.com/trenton.cotten",
  },
  {
    name: "Tyler Smith",
    image: tylerSmithImg,
    instagram: "https://www.instagram.com/dr_tyler_smith/",
    facebook: "https://www.facebook.com/DrTylerSmith",
  },
];

export default function Comedians() {
  return (
    <section id="comedians" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-display uppercase text-white mb-4">
            Our <span className="text-primary">Friends</span>
          </h2>
          <p className="text-gray-400 font-marker text-xl rotate-1">
            Comedians We Have Worked With.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {comedians.map((comedian, index) => (
            <motion.div
              key={comedian.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-lg aspect-square mb-4 border-2 border-transparent group-hover:border-primary transition-colors">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                <img
                  src={comedian.image}
                  alt={comedian.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Social Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex justify-center gap-4">
                  {comedian.instagram && (
                    <a
                      href={comedian.instagram}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${comedian.name} on Instagram`}
                    >
                      <FaInstagram className="w-5 h-5 text-white hover:text-primary cursor-pointer" />
                    </a>
                  )}
                  {comedian.facebook && (
                    <a
                      href={comedian.facebook}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${comedian.name} on Facebook`}
                    >
                      <FaFacebook className="w-5 h-5 text-white hover:text-primary cursor-pointer" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-display uppercase text-white mb-2">
                  {comedian.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
