type Params = {
  params: {
    serviceId: string;
  };
};

const serviceMeta: Record<
  string,
  { title: string; description: string; canonical: string }
> = {
  'civil-defense': {
    title: 'Civil Defense Approval Dubai | Building Approvals',
    description:
      'Get Dubai Civil Defense approvals and NOCs fast with expert fire safety consultants handling documentation, submissions, and inspections.',
    canonical: 'https://buildingapprovals.ae/services/civil-defense',
  },
  dewa: {
    title: 'DEWA Approval Service | Electricity & Water Connections',
    description:
      'Secure DEWA approvals for electricity and water connections with accurate load calculations, compliant drawings, and faster inspections.',
    canonical: 'https://buildingapprovals.ae/services/dewa',
  },
  'dubai-municipality': {
    title: 'Dubai Municipality Approval | Building Permits & Compliance',
    description:
      'Full Dubai Municipality building permit support: compliant drawings, multi-department coordination, and faster approvals for residential and commercial projects.',
    canonical: 'https://buildingapprovals.ae/services/dubai-municipality',
  },
  emaar: {
    title: 'Emaar Approval Services | Community NOCs',
    description:
      'Community NOC services for Emaar projects with compliant submissions, documentation, and authority liaison for smooth approvals.',
    canonical: 'https://buildingapprovals.ae/services/emaar',
  },
  nakheel: {
    title: 'Nakheel Approval Services | Development NOCs',
    description:
      'Get Nakheel approvals and development NOCs with precise documentation, drawings, and authority coordination for community compliance.',
    canonical: 'https://buildingapprovals.ae/services/nakheel',
  },
  'food-control': {
    title: 'Food Control Permit Dubai | Restaurant Compliance',
    description:
      'Obtain Food Control Department permits for restaurants and cafes in Dubai with compliant layouts, hygiene standards, and fast approvals.',
    canonical: 'https://buildingapprovals.ae/services/food-control',
  },
  jafza: {
    title: 'JAFZA Approval Services | Free Zone Projects',
    description:
      'JAFZA approvals for industrial and commercial projects with compliant documentation, inspections, and authority coordination.',
    canonical: 'https://buildingapprovals.ae/services/jafza',
  },
  dha: {
    title: 'DHA Approval | Healthcare Facility Licensing',
    description:
      'Dubai Health Authority approvals for clinics and healthcare facilities, including licensing, compliant plans, and inspection support.',
    canonical: 'https://buildingapprovals.ae/services/dha',
  },
  dso: {
    title: 'DSO Approval | Dubai Silicon Oasis Compliance',
    description:
      'Fast-track DSO approvals with compliant plans, documentation, and coordination for Silicon Oasis projects.',
    canonical: 'https://buildingapprovals.ae/services/dso',
  },
  dda: {
    title: 'Dubai Development Authority Approval',
    description:
      'Dubai Development Authority approvals with full documentation handling, compliant designs, and authority liaison.',
    canonical: 'https://buildingapprovals.ae/services/dda',
  },
  signage: {
    title: 'Signage Permit Dubai | Outdoor & Indoor Sign Approvals',
    description:
      'Secure Dubai signage permits with compliant designs, authority submissions, and faster approvals for indoor and outdoor signage.',
    canonical: 'https://buildingapprovals.ae/services/signage',
  },
  spa: {
    title: 'Spa Approval Dubai | Health & Safety Compliance',
    description:
      'Get Dubai spa approvals with hygienic layouts, safety compliance, and full authority submission support.',
    canonical: 'https://buildingapprovals.ae/services/spa',
  },
  shisha: {
    title: 'Shisha Cafe License Dubai | Permit & Compliance',
    description:
      'Shisha cafe licensing and approvals in Dubai with ventilation compliance, documentation, and authority coordination.',
    canonical: 'https://buildingapprovals.ae/services/shisha',
  },
  smoking: {
    title: 'Smoking Permit Dubai | Cafe & Lounge Approvals',
    description:
      'Smoking permits for cafes and lounges in Dubai with compliant ventilation, safety standards, and faster approvals.',
    canonical: 'https://buildingapprovals.ae/services/smoking',
  },
  pool: {
    title: 'Swimming Pool Approval Dubai | Design & Safety',
    description:
      'Dubai swimming pool approvals with compliant designs, safety standards, and authority submissions.',
    canonical: 'https://buildingapprovals.ae/services/pool',
  },
  solar: {
    title: 'Solar Approval Dubai | PV Permits & Grid Connection',
    description:
      'Secure solar PV approvals in Dubai with compliant designs, DEWA coordination, and grid connection support.',
    canonical: 'https://buildingapprovals.ae/services/solar',
  },
  tent: {
    title: 'Tent Approval Dubai | Temporary Structures',
    description:
      'Tent and temporary structure approvals in Dubai with safety compliance, documentation, and authority liaison.',
    canonical: 'https://buildingapprovals.ae/services/tent',
  },
  rta: {
    title: 'RTA Permit Dubai | Road & Transport Approvals',
    description:
      'RTA permits for Dubai projects, including road works, access, and transport-related approvals with compliant submissions.',
    canonical: 'https://buildingapprovals.ae/services/rta',
  },
  tecom: {
    title: 'Tecom & DCCA Approval | Free Zone Compliance',
    description:
      'Tecom/DCCA approvals with compliant designs, documentation, and authority coordination for free zone projects.',
    canonical: 'https://buildingapprovals.ae/services/tecom',
  },
  tpc: {
    title: 'Third Party Consultants | Authority Submission Support',
    description:
      'Third-party consultant support for Dubai authority submissions, compliance reviews, and faster approvals.',
    canonical: 'https://buildingapprovals.ae/services/tpc',
  },
  trakhees: {
    title: 'Trakhees Approval | Free Zone EHS & Building Permits',
    description:
      'Trakhees approvals for Dubai free zones with EHS compliance, building permits, and inspection coordination.',
    canonical: 'https://buildingapprovals.ae/services/trakhees',
  },
};

export default function Head({ params }: Params) {
  const meta = serviceMeta[params.serviceId] || {
    title: 'Dubai Authority Approval Services | Building Approvals',
    description:
      'Authority approvals and NOCs across Dubai, including Civil Defense, DEWA, Dubai Municipality, RTA, Trakhees, and more.',
    canonical: `https://buildingapprovals.ae/services/${params.serviceId}`,
  };

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={meta.canonical} />
    </>
  );
}
