/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="btn btn-secondary" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('quickstarts/quickstart-config.html')}>Get Started</Button>
            <Button href="https://wandisco.tech">WANdisco.tech</Button>
            <Button href="https://www.docker.com/get-started">Get Docker</Button>

          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl} = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );


    const Description = () => (
      <Block background="dark">
        {[
          {
            content: 'Welcome to our new docs site. More information coming soon.',
            image: `https://wandisco.com/assets/wandisco_logo2.svg`,
            imageAlign: 'left',
            title: '',
          },
        ]}
      </Block>
    );



    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: 'Migrate data to cloud without disruption or downtime.',
            image: `https://wandisco.com/assets/front-page/july-2019/hybrid-cloud.png`,
            imageAlign: 'top',
            title: 'LiveMigrator',
          },
          {
            content: 'Immediate analytic data access.',
            image: `https://wandisco.com/assets/blt81946ac27cc6a107/Flexibility.svg`,
            imageAlign: 'top',
            title: 'LiveAnalytics',
          },
        ]}
      </Block>
    );

    const Features2 = () => (
      <Block layout="fourColumn">
        {[
          {
            content: 'Get up and running in minutes with Fusion & Docker.',
            image: `img/docker.png`,
            imageAlign: 'top',
            title: 'Docker',
          },
          {
            content: 'Manage your whole Fusion ecosystem in one place.',
            image: `https://wandisco.com/assets/partnerpages/oracle/WD_Oracle_Benefits-03.png`,
            imageAlign: 'top',
            title: 'OneUI',
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;


    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <Features2 />
          <Description />
        </div>
      </div>
    );
  }
}

module.exports = Index;
