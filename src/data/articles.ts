export interface Article {
  id: number;
  title: string;
  category: string;
  date: string;
  datetime: string;
  image: string;
  desc: string;
  alt: string;
}

export const articles: Article[] = [
  {
    id: 1,
    title: "Dinkominfo Tingkatkan Kapasitas SDM Digital Melalui Pelatihan Cybersecurity",
    category: "Teknologi",
    date: "10 Des 2024",
    datetime: "2024-12-10",
    image: "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FKemanan_Siber_3_2a13d3ee69.jpeg&w=1200&q=75",
    desc: "Workshop intensif untuk operator IT memperkuat perlindungan data dan layanan publik Kabupaten Pekalongan.",
    alt: "Pelatihan keamanan siber Dinkominfo"
  },
  {
    id: 2,
    title: "Command Center Perkuat Respons Cepat Pelayanan Publik",
    category: "Layanan",
    date: "28 Nov 2024",
    datetime: "2024-11-28",
    image: "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FRakor_JKS_1265587acc.jpeg&w=1200&q=75",
    desc: "Pusat integrasi data membantu pemerintah daerah memantau layanan dan menindaklanjuti kebutuhan warga secara cepat.",
    alt: "Rapat koordinasi layanan digital"
  },
  {
    id: 3,
    title: "Literasi Digital Dorong Masyarakat Bijak Bermedia Sosial",
    category: "Informasi",
    date: "16 Nov 2024",
    datetime: "2024-11-16",
    image: "https://picsum.photos/seed/literasi-digital/640/360",
    desc: "Edukasi bersama komunitas dan pelajar memperkuat kemampuan warga dalam menyaring informasi di ruang digital.",
    alt: "Kegiatan literasi digital masyarakat"
  },
  {
    id: 4,
    title: "Forum Satu Data Wujudkan Data Pemerintahan yang Terpadu",
    category: "Pemerintahan",
    date: "31 Okt 2024",
    datetime: "2024-10-31",
    image: "https://picsum.photos/seed/satu-data/640/360",
    desc: "Kolaborasi perangkat daerah memastikan data pembangunan tersedia, mutakhir, dan mudah dimanfaatkan.",
    alt: "Forum satu data Kabupaten Pekalongan"
  },
  {
    id: 5,
    title: "Pemerintah Daerah Perluas Akses Layanan Publik Digital",
    category: "Layanan",
    date: "18 Okt 2024",
    datetime: "2024-10-18",
    image: "https://picsum.photos/seed/pelayanan-publik/640/360",
    desc: "Pengembangan kanal layanan memudahkan masyarakat memperoleh informasi dan menyampaikan kebutuhan secara daring.",
    alt: "Pelayanan publik digital"
  },
  {
    id: 6,
    title: "Kolaborasi Komunitas Percepat Transformasi Digital Daerah",
    category: "Kegiatan",
    date: "04 Okt 2024",
    datetime: "2024-10-04",
    image: "https://picsum.photos/seed/dinkominfo-event/640/360",
    desc: "Kemitraan pemerintah, pelaku usaha, dan komunitas membuka ruang inovasi bagi masyarakat Kabupaten Pekalongan.",
    alt: "Dokumentasi kegiatan Dinkominfo"
  },
];
