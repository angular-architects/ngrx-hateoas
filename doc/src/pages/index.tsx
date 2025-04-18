import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import angularArchitectsLogoUrl from '@site/static/img/angular-architects-logo.png';
import fancyDevelopmentLogoUrl from '@site/static/img/fancy-development-logo.png';
import fancyDevelopmentLogoDarkUrl from '@site/static/img/fancy-development-logo-dark.png';
import Heading from '@theme/Heading';

function HeaderIcon({ gradientId }: { gradientId: string }) {
  return (
    <div className="largeIcon">
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.18978 10.8961C8.57848 11.4157 9.0744 11.8457 9.64388 12.1568C10.2134 12.468 10.8431 12.653 11.4904 12.6993C12.1377 12.7457 12.7874 12.6523 13.3954 12.4255C14.0034 12.1987 14.5555 11.8438 15.0143 11.3848L17.7296 8.66949C18.554 7.81596 19.0101 6.6728 18.9998 5.48622C18.9895 4.29964 18.5136 3.16457 17.6745 2.3255C16.8354 1.48643 15.7004 1.01048 14.5138 1.00017C13.3272 0.98986 12.184 1.44601 11.3305 2.27037L9.77372 3.81811M11.8102 9.08584C11.4215 8.56619 10.9256 8.13622 10.3561 7.82508C9.78663 7.51394 9.15688 7.32892 8.5096 7.28256C7.86232 7.2362 7.21264 7.3296 6.60462 7.5564C5.99661 7.78321 5.44449 8.13813 4.9857 8.59708L2.27037 11.3124C1.44601 12.1659 0.98986 13.3091 1.00017 14.4957C1.01048 15.6823 1.48643 16.8173 2.3255 17.6564C3.16457 18.4955 4.29964 18.9714 5.48622 18.9817C6.6728 18.992 7.81596 18.5359 8.66949 17.7115L10.2172 16.1638"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <defs>
          <linearGradient id={gradientId} x1="7.06356" y1="-1.17023" x2="19.6321" y2="0.307564" gradientUnits="userSpaceOnUse">
            <stop stopColor="#CE1242"></stop>
            <stop offset="1" stopColor="#F7966E"></stop>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <div className='container'>
      <div className='row'>
        <header>
          <div className="sm">
            <HeaderIcon gradientId="gradient-top" />
          </div>
          <div>
            <h1><span className="font-gradient">ngrx-hateoas</span></h1>
            <h2>{siteConfig.tagline}</h2>
            <h3>Transfers state from the backend into the Signal Store, helps to mutate the state and sends it back.</h3>
            <Link
              className="button button--secondary button--lg primaryButton"
              to="/docs/guide/intro">
              Get Started
            </Link>
          </div>
          <div className="mdAndUp">
            <HeaderIcon gradientId="gradient-side" />
          </div>
        </header>
        <div className='supporters'>
          <h1>Supported by</h1>
          <div>
            <img
              src={angularArchitectsLogoUrl}
              alt="Angular Architects Logo"
              style={{ width: '180px', height: 'auto' }}
            />
            <img 
              className="darkOnly"
              src={fancyDevelopmentLogoUrl}
              alt="Angular Architects Logo"
              style={{ width: '180px', height: 'auto' }}
            />
            <img
              className="lightOnly"
              src={fancyDevelopmentLogoDarkUrl}
              alt="Angular Architects Logo"
              style={{ width: '180px', height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <div className="homeContainer">
        <HomepageHeader />
        <main>
          <HomepageFeatures />
        </main>
      </div>
    </Layout>
  );
}
