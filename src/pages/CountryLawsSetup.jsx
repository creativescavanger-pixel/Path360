import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GlobalComplianceChecklist from '../components/GlobalComplianceChecklist.jsx'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  getCountryBySlug,
  getCountryCoverageLabel,
  getCountryFlag,
} from '../lib/countryCatalogue.js'

const COUNTRY_RESOURCES = {
  kenya: {
    entity: {
      label: 'Kenya Business Registration Service',
      url: 'https://brs.go.ke/',
    },
    tax: {
      label: 'Kenya Revenue Authority',
      url: 'https://www.kra.go.ke/',
    },
    innovation: {
      label: 'Kenya National Innovation Agency',
      url: 'https://www.innovationagency.go.ke/',
    },
  },
  'united-states': {
    entity: {
      label: 'U.S. Small Business Administration',
      url: 'https://www.sba.gov/',
    },
    tax: {
      label: 'Internal Revenue Service',
      url: 'https://www.irs.gov/businesses',
    },
    innovation: {
      label: 'U.S. Patent and Trademark Office',
      url: 'https://www.uspto.gov/',
    },
  },
}

function createItem(id, label, description, riskLevel, links = []) {
  return {
    id,
    label,
    description,
    riskLevel,
    status: 'not_started',
    links,
  }
}

function getCountryLinks(country) {
  const resources = COUNTRY_RESOURCES[country.slug] || {}

  return {
    entity: resources.entity ? [resources.entity] : [],
    tax: resources.tax ? [resources.tax] : [],
    innovation: resources.innovation ? [resources.innovation] : [],
  }
}

function buildBaselineCategories(country) {
  const links = getCountryLinks(country)

  return [
    {
      id: 'company-governance',
      label: 'Company setup & governance',
      summary:
        'Make ownership, entity structure, authority, and intellectual-property responsibilities clear before major commitments.',
      items: [
        createItem(
          'entity-structure',
          'Choose and verify the company structure',
          `Confirm the entity form, incorporation location, ownership implications, local-presence needs, and registration process that apply to your venture in ${country.name}.`,
          'high',
          links.entity,
        ),
        createItem(
          'formation-records',
          'Complete registration and retain statutory records',
          'Organise incorporation documents, statutory registers, registered addresses, permits, renewal dates, and records of formal company decisions.',
          'high',
          links.entity,
        ),
        createItem(
          'founder-agreements',
          'Document founder ownership and decision rights',
          'Put equity allocation, vesting, roles, voting, departures, dispute handling, and decision-making responsibilities in writing.',
          'high',
        ),
        createItem(
          'ip-assignment',
          'Secure intellectual-property ownership',
          'Ensure founders, employees, contractors, advisors, and agencies assign relevant work product and confidential know-how to the company.',
          'high',
          links.innovation,
        ),
      ],
    },
    {
      id: 'tax-accounting',
      label: 'Tax & accounting',
      summary:
        'Build reliable financial records and identify the tax registrations, filings, and payment obligations that could apply.',
      items: [
        createItem(
          'tax-registration',
          'Identify applicable tax registrations',
          'Verify potential income-tax, indirect-tax, payroll, withholding, local-tax, and registration-threshold obligations with qualified advice.',
          'high',
          links.tax,
        ),
        createItem(
          'financial-records',
          'Set up reliable bookkeeping and financial records',
          'Maintain consistent records for revenue, expenses, invoices, payroll, cash position, contracts, and supporting documents.',
          'medium',
        ),
        createItem(
          'filing-calendar',
          'Create a filing and payment calendar',
          'Track recurring tax returns, payments, statutory accounts, annual renewals, and responsible owners before deadlines become urgent.',
          'high',
          links.tax,
        ),
      ],
    },
    {
      id: 'employment-hr',
      label: 'Employment & HR',
      summary:
        'Engage people through clear agreements, suitable worker classification, and compliant people operations.',
      items: [
        createItem(
          'worker-classification',
          'Confirm worker classification and engagement model',
          'Assess whether founders, employees, contractors, advisors, and remote workers are classified appropriately in each relevant location.',
          'high',
        ),
        createItem(
          'written-agreements',
          'Use written employment and contractor agreements',
          'Cover pay, duties, confidentiality, intellectual property, notice, termination, benefits, and governing law where appropriate.',
          'high',
        ),
        createItem(
          'payroll-contributions',
          'Check payroll and statutory contribution obligations',
          'Verify withholding, social-security, pension, insurance, leave, reporting, and employer obligations before the first hire.',
          'high',
          links.tax,
        ),
      ],
    },
    {
      id: 'data-privacy',
      label: 'Data & privacy',
      summary:
        'Understand the personal and business data you handle, then establish suitable governance, transparency, and security practices.',
      items: [
        createItem(
          'data-map',
          'Map the data you collect and process',
          'Document what data is collected, why it is needed, where it is stored, who can access it, and which vendors receive it.',
          'high',
        ),
        createItem(
          'privacy-notices',
          'Publish appropriate privacy and consent notices',
          'Make privacy information, permissions, customer communications, and consent practices clear and suitable for your product and markets.',
          'high',
        ),
        createItem(
          'security-controls',
          'Implement proportionate security controls',
          'Use access controls, backups, vendor review, incident procedures, and team practices that match the sensitivity of the data you handle.',
          'medium',
        ),
      ],
    },
    {
      id: 'sector-consumer',
      label: 'Sector licences & customer rules',
      summary:
        'Identify regulated activities, customer protections, marketing requirements, approvals, and renewals relevant to your venture.',
      items: [
        createItem(
          'regulated-activity',
          'Screen your venture for regulated activities',
          'Check whether your model touches regulated finance, health, education, telecoms, transport, food, energy, insurance, payments, or other controlled activities.',
          'high',
          links.innovation,
        ),
        createItem(
          'consumer-terms',
          'Review customer terms and consumer disclosures',
          'Make pricing, refunds, service terms, marketing claims, data statements, and support practices clear for the customers you serve.',
          'medium',
        ),
        createItem(
          'licence-renewals',
          'Track permits, approvals, and renewal obligations',
          'Keep a register of licences, responsible owners, dates, conditions, and evidence required to keep operating permission current.',
          'high',
        ),
      ],
    },
    {
      id: 'cross-border',
      label: 'Cross-border, FX & contracting',
      summary:
        'Prepare for international customers, suppliers, hiring, fundraising, payments, and expansion without overlooking operating exposure.',
      items: [
        createItem(
          'cross-border-tax',
          'Assess cross-border tax and presence risk',
          'Check whether overseas sales, staff, contractors, entities, management activity, or inventory could create tax or registration obligations.',
          'high',
          links.tax,
        ),
        createItem(
          'payments-fx',
          'Validate payment, FX, and funds-movement workflows',
          'Confirm how the company can receive, hold, convert, pay, and repatriate funds in relevant currencies and jurisdictions.',
          'high',
        ),
        createItem(
          'commercial-contracts',
          'Use fit-for-purpose commercial contracts',
          'Set clear terms with customers, suppliers, distributors, partners, and investors, including payment, liability, data, intellectual property, and dispute provisions.',
          'high',
        ),
      ],
    },
  ]
}

function mergeSavedStatuses(categories, savedCategories) {
  const savedCategoryMap = new Map(
    (Array.isArray(savedCategories) ? savedCategories : []).map((category) => [
      category.id,
      category,
    ]),
  )

  return categories.map((category) => {
    const savedCategory = savedCategoryMap.get(category.id)
    const savedItemMap = new Map(
      (Array.isArray(savedCategory?.items) ? savedCategory.items : []).map(
        (item) => [item.id, item],
      ),
    )

    return {
      ...category,
      items: category.items.map((item) => {
        const savedItem = savedItemMap.get(item.id)
        return savedItem?.status
          ? { ...item, status: savedItem.status }
          : item
      }),
    }
  })
}

function buildComplianceProfile(country, context, savedProfile) {
  const stage = context.stage || 'mvp'
  const corridor = context.corridor || 'global'
  const categories = mergeSavedStatuses(
    buildBaselineCategories(country),
    savedProfile?.categories,
  )

  return {
    countryCode: country.code,
    countryName: country.name,
    stage: savedProfile?.stage || stage,
    corridor: savedProfile?.corridor || corridor,
    lastUpdated:
      savedProfile?.updatedAt ||
      savedProfile?.lastUpdated ||
      savedProfile?.last_updated ||
      'Not started yet',
    categories,
  }
}

function CountryNotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 24,
        }}
      >
        <div
          style={{
            color: '#8A6E2A',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Laws & Company Setup
        </div>
        <h1
          style={{
            color: '#1C1C1A',
            fontSize: 25,
            letterSpacing: '-0.03em',
            margin: '0 0 8px',
          }}
        >
          Country not found
        </h1>
        <p
          style={{
            color: '#6B6965',
            fontSize: 13,
            lineHeight: 1.7,
            margin: '0 0 16px',
          }}
        >
          Return to the Country Directory and choose a country or jurisdiction to begin your operating checklist.
        </p>
        <button
          type="button"
          onClick={() => navigate('/app/environment/countries')}
          style={{
            border: '1px solid #765A1E',
            background: '#765A1E',
            color: '#FFFFFF',
            borderRadius: 10,
            padding: '10px 13px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Browse countries →
        </button>
      </section>
    </div>
  )
}

export default function CountryLawsSetup() {
  const navigate = useNavigate()
  const { countrySlug } = useParams()
  const country = useMemo(() => getCountryBySlug(countrySlug), [countrySlug])

  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const assessmentResults = useDiagnosticStore((state) => state.assessmentResults)
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)
  const corridor = useDiagnosticStore((state) => state.corridor)
  const complianceProgress = useDiagnosticStore(
    (state) => state.complianceProgress || {},
  )

  if (!country) return <CountryNotFound />

  const stage =
    diagnosedStage ||
    assessmentResults?.diagnosedStage ||
    assessmentResults?.venturestage ||
    founderProfile?.venturestage ||
    founderProfile?.venture_stage ||
    'mvp'

  const complianceProfile = buildComplianceProfile(
    country,
    {
      stage,
      corridor: corridor?.label || 'global',
    },
    complianceProgress[country.code],
  )

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <section
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 58%, #FCF8EE 100%)',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 22,
          marginBottom: 16,
          boxShadow: '0 8px 20px rgba(22,24,27,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <div
              style={{
                color: '#8A6E2A',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Company setup
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>
                {getCountryFlag(country.code)}
              </span>
              <h1
                style={{
                  color: '#1C1C1A',
                  fontSize: 28,
                  lineHeight: 1.12,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                Set up and run in {country.name}
              </h1>
            </div>
            <p
              style={{
                color: '#6B6965',
                fontSize: 13,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Work through the operating questions that matter as your venture takes on customers, hires people, handles data, enters contracts, or expands across borders.
            </p>
          </div>

          <div
            style={{
              minWidth: 215,
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 14,
              padding: 13,
            }}
          >
            <div
              style={{
                color: '#8C8A84',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Available detail
            </div>
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 5,
              }}
            >
              {getCountryCoverageLabel(country.coverage)}
            </div>
            <div
              style={{
                color: '#6B6965',
                fontSize: 11,
                lineHeight: 1.55,
              }}
            >
              {country.subregion} · {country.region}
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/app/environment')}
          style={{
            border: '1px solid #D8D3C9',
            background: '#FFFFFF',
            color: '#5F5B56',
            borderRadius: 9,
            padding: '8px 11px',
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ← Explore markets
        </button>
        <button
          type="button"
          onClick={() => navigate(`/app/environment/countries/${country.slug}`)}
          style={{
            border: '1px solid #D8D3C9',
            background: '#FFFFFF',
            color: '#5F5B56',
            borderRadius: 9,
            padding: '8px 11px',
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Market overview
        </button>
        <button
          type="button"
          onClick={() => navigate(`/app/environment/pestel/${country.slug}`)}
          style={{
            border: '1px solid #D8D3C9',
            background: '#FFFFFF',
            color: '#5F5B56',
            borderRadius: 9,
            padding: '8px 11px',
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          External forces
        </button>
        <button
          type="button"
          onClick={() => navigate(`/app/environment/ecosystem/${country.slug}`)}
          style={{
            border: '1px solid #D8D3C9',
            background: '#FFFFFF',
            color: '#5F5B56',
            borderRadius: 9,
            padding: '8px 11px',
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Startup support
        </button>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(260px, 0.75fr)',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#8A6E2A',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Start with the foundations
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            Make ownership and company setup clear before major commitments
          </div>
          <div
            style={{
              color: '#5F5B56',
              fontSize: 12.5,
              lineHeight: 1.75,
            }}
          >
            Begin with company setup and governance, then work through the categories that apply to your current stage and operating model. Mark a check as in progress while you gather documents, verify official guidance, or seek qualified local advice.
          </div>
        </div>

        <div
          style={{
            background: '#FCF8EE',
            border: '1px solid #EEE4C9',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#8A6E2A',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Important note
          </div>
          <div
            style={{
              color: '#6B6965',
              fontSize: 11.5,
              lineHeight: 1.7,
            }}
          >
            This is educational operating guidance, not legal, tax, employment, immigration, regulatory, or investment advice. Requirements can vary by company structure, locality, sector, customers, team, and commercial activity.
          </div>
        </div>
      </section>

      <GlobalComplianceChecklist profile={complianceProfile} />
    </div>
  )
}