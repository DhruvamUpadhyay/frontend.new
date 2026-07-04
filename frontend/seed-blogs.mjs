import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BLOGS = [
  {
    title: "Mastering DNA Profiling: The Science of Genetic Fingerprinting",
    slug: "mastering-dna-profiling",
    excerpt: "Explore the revolutionary molecular biology techniques used to isolate and match DNA evidence in criminal investigations.",
    content: `## The Molecular Blueprint of Crime Solving

Deoxyribonucleic acid (DNA) is the fundamental molecule that encodes the genetic instructions for all living organisms. In the realm of forensic science, **DNA profiling** (also known as genetic fingerprinting) has emerged as the gold standard for identifying suspects, exonerating the innocent, and solving cold cases. 

But how do forensic scientists extract a genetic profile from a microscopic drop of blood or a single hair follicle?

### 1. Isolation and Extraction
The first step in DNA analysis is isolating the DNA molecule from other cellular components (proteins, lipids, and organelles) that might interfere with chemical reactions. Using specialized forensic reagents, cell walls are lysed, and the DNA is purified. 

### 2. Amplification via Polymerase Chain Reaction (PCR)
Often, the biological material gathered at a crime scene is extremely minute or partially degraded. Forensic labs use **PCR** to amplify specific regions of the DNA, effectively replicating millions of copies of a target sequence. 

### 3. Analyzing Short Tandem Repeats (STRs)
Human DNA contains regions that repeat in specific patterns, known as **Short Tandem Repeats (STRs)**. Because the number of repeats at any given locus varies greatly between individuals, comparing STR profiles across 13 to 20 standardized loci makes the statistical probability of a random match less than one in a trillion.

> **Key Fact:** Standard forensic DNA profiles do not scan the entire genome, but rather focus on these highly variable, non-coding STR regions to safeguard privacy while maintaining absolute identification accuracy.

### 4. Capillary Electrophoresis and Matching
Once amplified, the STR fragments are separated by size using capillary electrophoresis. The result is a digital electropherogram showing peaks that represent the alleles at each locus. This profile can then be compared directly to suspect profiles or queried against national databases like CODIS.`,
    coverImage: "/media/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png",
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    title: "Digital Footprints: Tracking Cybercriminals Across the Dark Web",
    slug: "tracking-digital-footprints",
    excerpt: "Learn how modern digital forensics specialists recover deleted logs and trace network vectors to capture cybercriminals.",
    content: `## Unmasking the Invisible: Digital Forensics in Action

As criminals shift their operations to the digital realm, forensic investigators must adapt. From ransomware deployments to dark web marketplace hosting, **digital forensics** has become the frontline defense against high-tech crime.

A computer doesn't lie, but it takes advanced analytical techniques to decrypt its stories.

### The Phases of Digital Investigation

1. **Acquisition and Preservation:**
   The golden rule of digital forensics is to **never perform analysis on the original evidence**. Investigators create bit-stream copies of hard drives and flash memory (using write-blockers to prevent data modifications) to maintain chain of custody integrity.

2. **Registry and Log Analysis:**
   Operating systems are constantly logging user activities. Forensics experts analyze system registries, shellbags, browser histories, and event logs to construct a timeline of actions. Even deleted files can often be recovered because the OS simply marks that disk space as "available" rather than immediately overwriting it.

3. **Network Vector Tracking:**
   Tracing traffic through onion routers (Tor) or encrypted VPN nodes requires analyzing server metadata, packet headers, and timing correlations. By analyzing leakage points in network interfaces, digital sleuths can pin down physical IP addresses.

### The Challenge of Modern Encryption
With the rise of end-to-end encryption and decentralized cryptocurrencies, cybercriminals attempt to operate in total anonymity. However, through RAM imaging (capturing volatile memory before a system shuts down) and cryptographic key recovery, investigators are continuously breaking through encrypted barriers.`,
    coverImage: "/media/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png",
    published: true,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    title: "Introduction to Forensic Ballistics: Reading Toolmarks on Bullet Casings",
    slug: "forensic-ballistics-guide",
    excerpt: "Understand how firearms leave unique striations and firing pin marks on bullets, allowing investigators to trace ballistics.",
    content: `## The Metallic Signature of Firearms

When a firearm is discharged, it leaves a series of microscopic markings on both the bullet and the cartridge casing. These markings, known as **toolmarks**, serve as a metallic signature that can link a fired projectile directly back to the specific weapon that fired it.

### The Mechanics of Firearm Marks

* **Rifling Striations:**
  The inside barrel of a rifle or handgun is cut with spiral grooves (rifling) to spin the bullet, stabilizing its flight. As the bullet travels down the barrel, the harder steel barrel cuts microscopic scratches (striations) into the softer lead or copper bullet jacket.
  
* **Breech Face Impressions:**
  When gunpowder explodes, it forces the bullet forward and pushes the cartridge casing backward against the breech face of the firearm. The intense pressure stamps the micro-textures of the breech face directly onto the primer cup of the casing.

* **Firing Pin Marks:**
  The firing pin strikes the primer to ignite the propellant. The shape, depth, and micro-imperfections of the firing pin's tip leave a distinct impression in the soft metal cup.

### Comparison Microscopy: The Matching Process
Ballistics experts use comparison microscopes to view two casings side-by-side at identical magnifications. By aligning the breech face scratches, firing pin indentations, and ejector marks, investigators can determine if a cartridge found at a crime scene matches test-fired casings from a seized weapon.

These matches are logged in automated databases like NIBIN, helping law enforcement connect firearm crimes across multiple jurisdictions.`,
    coverImage: "/media/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png",
    published: true,
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

async function seed() {
  console.log("Seeding 3 Forensic Science Blogs...");
  const blogsCol = collection(db, 'blogs');
  
  for (const blog of BLOGS) {
    // Check if slug already exists to prevent duplicate entries
    const q = query(blogsCol, where('slug', '==', blog.slug));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      const docRef = await addDoc(blogsCol, blog);
      console.log(`Successfully added: "${blog.title}" (ID: ${docRef.id})`);
    } else {
      console.log(`Skipping duplicate: "${blog.title}"`);
    }
  }
  
  console.log("Seeding finished successfully.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
