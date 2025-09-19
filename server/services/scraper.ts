import * as cheerio from 'cheerio';

export interface ScrapingResult {
  title: string;
  content: any;
  dataPoints: number;
  metadata: any;
}

export class WebScraper {
  async scrapeWebsite(url: string, type: string = 'Full Page Content'): Promise<ScrapingResult> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      let result: ScrapingResult;

      switch (type) {
        case 'Text Only':
          result = this.extractTextOnly($);
          break;
        case 'Links & Images':
          result = this.extractLinksAndImages($);
          break;
        case 'Product Data':
          result = this.extractProductData($);
          break;
        default:
          result = this.extractFullPageContent($);
      }

      result.metadata = {
        url,
        scrapedAt: new Date().toISOString(),
        type,
        responseStatus: response.status,
      };

      return result;
    } catch (error: any) {
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  private extractFullPageContent($: cheerio.CheerioAPI): ScrapingResult {
    const title = $('title').text() || $('h1').first().text() || 'No title found';
    
    // Remove scripts, styles, and comments
    $('script, style, noscript').remove();
    
    const content = {
      title,
      headings: this.extractHeadings($),
      paragraphs: this.extractParagraphs($),
      links: this.extractLinks($),
      images: this.extractImages($),
      lists: this.extractLists($),
    };

    const dataPoints = Object.values(content).reduce((sum, arr) => {
      return sum + (Array.isArray(arr) ? arr.length : 1);
    }, 0);

    return { title, content, dataPoints, metadata: {} };
  }

  private extractTextOnly($: cheerio.CheerioAPI): ScrapingResult {
    const title = $('title').text() || $('h1').first().text() || 'No title found';
    $('script, style, noscript').remove();
    
    const textContent = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .split('.')
      .filter(sentence => sentence.length > 10);

    const content = {
      title,
      sentences: textContent,
      wordCount: textContent.join(' ').split(' ').length,
    };

    return { title, content, dataPoints: textContent.length, metadata: {} };
  }

  private extractLinksAndImages($: cheerio.CheerioAPI): ScrapingResult {
    const title = $('title').text() || 'Links & Images';
    
    const links = this.extractLinks($);
    const images = this.extractImages($);
    
    const content = { links, images };
    const dataPoints = links.length + images.length;

    return { title, content, dataPoints, metadata: {} };
  }

  private extractProductData($: cheerio.CheerioAPI): ScrapingResult {
    const title = $('title').text() || 'Product Data';
    
    const products: Array<{name?: string, price?: string, description?: string, image?: string, url?: string}> = [];
    
    // Common product selectors
    const productSelectors = [
      '[itemtype*="Product"]',
      '.product',
      '[data-product]',
      '.item',
    ];

    productSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const $el = $(element);
        const product = {
          name: $el.find('h1, h2, h3, .title, .name').first().text().trim(),
          price: $el.find('[class*="price"], .cost, .amount').first().text().trim(),
          description: $el.find('.description, .summary, p').first().text().trim(),
          image: $el.find('img').first().attr('src'),
          url: $el.find('a').first().attr('href'),
        };
        
        if (product.name || product.price) {
          products.push(product);
        }
      });
    });

    const content = { products };
    return { title, content: { products }, dataPoints: products.length, metadata: {} };
  }

  private extractHeadings($: cheerio.CheerioAPI): string[] {
    const headings: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim();
      if (text) headings.push(text);
    });
    return headings;
  }

  private extractParagraphs($: cheerio.CheerioAPI): string[] {
    const paragraphs: string[] = [];
    $('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 20) paragraphs.push(text);
    });
    return paragraphs;
  }

  private extractLinks($: cheerio.CheerioAPI): Array<{text: string, href: string}> {
    const links: Array<{text: string, href: string}> = [];
    $('a[href]').each((_, element) => {
      const $el = $(element);
      const href = $el.attr('href');
      const text = $el.text().trim();
      if (href && text) {
        links.push({ text, href });
      }
    });
    return links;
  }

  private extractImages($: cheerio.CheerioAPI): Array<{src: string, alt: string}> {
    const images: Array<{src: string, alt: string}> = [];
    $('img[src]').each((_, element) => {
      const $el = $(element);
      const src = $el.attr('src');
      const alt = $el.attr('alt') || '';
      if (src) {
        images.push({ src, alt });
      }
    });
    return images;
  }

  private extractLists($: cheerio.CheerioAPI): Array<{type: string, items: string[]}> {
    const lists: Array<{type: string, items: string[]}> = [];
    $('ul, ol').each((_, element) => {
      const $el = $(element);
      const type = element.tagName.toLowerCase();
      const items: string[] = [];
      $el.find('li').each((_, li) => {
        const text = $(li).text().trim();
        if (text) items.push(text);
      });
      if (items.length > 0) {
        lists.push({ type, items });
      }
    });
    return lists;
  }
}

export const webScraper = new WebScraper();
