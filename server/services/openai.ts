import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  content: string;
  analysis?: any;
}

export class DataAnalysisService {
  async analyzeData(userQuery: string, scrapedData: any[]): Promise<ChatResponse> {
    try {
      const dataContext = this.prepareDataContext(scrapedData);
      
      const prompt = `You are an AI data analyst helping a product manager analyze scraped web and social media data. 

User Question: ${userQuery}

Available Data Context:
${dataContext}

Please provide a helpful analysis based on the available data. If you identify trends, patterns, or insights, present them clearly. If the data is insufficient to answer the question, suggest what additional data might be needed.

Respond in a conversational, helpful tone as if you're a data analyst colleague.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system", 
            content: "You are a helpful AI data analyst for product managers. Provide clear, actionable insights from scraped data."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return {
        content: response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.",
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        content: "I'm having trouble analyzing the data right now. Please check your API configuration and try again.",
      };
    }
  }

  async generateDataSummary(scrapedData: any[]): Promise<ChatResponse> {
    try {
      const dataContext = this.prepareDataContext(scrapedData);
      
      const prompt = `Analyze the following scraped data and provide a comprehensive summary with key insights:

${dataContext}

Please provide:
1. Overview of data sources and types
2. Key patterns or trends identified
3. Most frequently mentioned topics/keywords
4. Notable findings or anomalies
5. Recommendations for product managers

Format your response in JSON with the following structure:
{
  "summary": "Brief overview",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "topKeywords": [{"keyword": "example", "frequency": 10}],
  "recommendations": ["recommendation1", "recommendation2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        content: this.formatSummaryResponse(analysis),
        analysis,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        content: "I'm having trouble generating a summary right now. Please try again later.",
      };
    }
  }

  private prepareDataContext(scrapedData: any[]): string {
    if (!scrapedData || scrapedData.length === 0) {
      return "No scraped data available.";
    }

    const summary = scrapedData.slice(0, 10).map(item => {
      return `Source: ${item.source} (${item.type})
Title: ${item.title || 'No title'}
Data Points: ${item.dataPoints || 0}
Status: ${item.status}
Content Preview: ${this.getContentPreview(item.content)}
---`;
    }).join('\n');

    return `Total Records: ${scrapedData.length}
Recent Data (showing up to 10 items):

${summary}`;
  }

  private getContentPreview(content: any): string {
    if (!content) return 'No content';
    
    if (typeof content === 'string') {
      return content.substring(0, 200) + (content.length > 200 ? '...' : '');
    }
    
    if (content.title) return content.title;
    if (content.paragraphs && content.paragraphs.length > 0) {
      return content.paragraphs[0].substring(0, 200) + '...';
    }
    if (content.sentences && content.sentences.length > 0) {
      return content.sentences[0].substring(0, 200) + '...';
    }
    
    return JSON.stringify(content).substring(0, 200) + '...';
  }

  private formatSummaryResponse(analysis: any): string {
    if (!analysis) return "Unable to generate summary.";
    
    let response = `## Data Summary\n\n${analysis.summary || 'No summary available'}\n\n`;
    
    if (analysis.keyInsights && analysis.keyInsights.length > 0) {
      response += `## Key Insights\n`;
      analysis.keyInsights.forEach((insight: string, index: number) => {
        response += `${index + 1}. ${insight}\n`;
      });
      response += '\n';
    }
    
    if (analysis.topKeywords && analysis.topKeywords.length > 0) {
      response += `## Top Keywords\n`;
      analysis.topKeywords.slice(0, 5).forEach((item: any, index: number) => {
        response += `${index + 1}. "${item.keyword}" (${item.frequency} mentions)\n`;
      });
      response += '\n';
    }
    
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      response += `## Recommendations\n`;
      analysis.recommendations.forEach((rec: string, index: number) => {
        response += `${index + 1}. ${rec}\n`;
      });
    }
    
    return response;
  }
}

export const dataAnalysisService = new DataAnalysisService();
