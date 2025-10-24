// src/pages/FAQ.jsx

import React from 'react';
import { useTranslation } from 'react-i18next'; 
import Layout from '../components/Layout';

const FAQ = () => {
  const { t } = useTranslation(); 
   const questions = t('faq_page.questions', { returnObjects: true });
  const questionList = Array.isArray(questions) ? questions : [];

  return (
    <Layout>
      <div className="faq-container">
        <h1>{t('faq_page.title')}</h1>

         {questionList.map((faq, index) => {
          if (!faq || !faq.question || !faq.answer) {
            return null;
          }
          return (
            <div className="faq-item" key={faq.question ?? index}>
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
            </div>
          );
        })}
      
      </div>
    </Layout>
  );
};

export default FAQ;
