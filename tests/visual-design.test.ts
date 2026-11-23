import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyDesign,visualDesignCss,validDesignSelector,designSections} from '../lib/visual-design.ts';
import {visualDesignSchema} from '../lib/validation.ts';
const selector='[data-design-id="hero"] > div:nth-of-type(2) > h1:nth-of-type(1)';
test('visual editor accepts scoped selectors and rejects selector escape or CSS injection',()=>{
 assert.ok(validDesignSelector(selector));
 for(const value of ['body','[data-design-id="hero"] body','[data-design-id="hero"]{color:red}/*','[data-design-id="hero"],body','[data-design-id="hero"] > script:nth-of-type(0)'])assert.equal(validDesignSelector(value),false);
 assert.equal(visualDesignSchema.safeParse({...emptyDesign(),elements:{[selector]:{desktop:{backgroundColor:'url(https://example.com)'}}}}).success,false);
 assert.equal(visualDesignSchema.safeParse({...emptyDesign(),elements:{body:{desktop:{color:'#ffffff'}}}}).success,false);
});
test('desktop and phone styles have separate breakpoints and use only supported properties',()=>{
 const css=visualDesignCss({...emptyDesign(),elements:{[selector]:{desktop:{fontSize:64,color:'#ff6600',offsetX:16},mobile:{fontSize:30,textAlign:'center'}}}});
 assert.match(css,/@media\(min-width:681px\)/);assert.match(css,/font-size:64px/);assert.match(css,/@media\(max-width:680px\)/);assert.match(css,/font-size:30px/);assert.match(css,/translate:16px 0px/);
});
test('section order rejects duplicates and unknown sections and keeps missing sections visible',()=>{
 assert.equal(visualDesignSchema.safeParse({...emptyDesign(),sectionOrder:['hero','hero']}).success,false);
 assert.equal(visualDesignSchema.safeParse({...emptyDesign(),sectionOrder:['admin']}).success,false);
 const css=visualDesignCss({...emptyDesign(),sectionOrder:['faq','hero']});assert.match(css,/"faq"\]\{order:0/);
 for(const section of designSections)assert.ok(css.includes(`[data-design-id="${section.id}"]`));
});
test('theme colors are isolated by mode and unsafe or oversized design values are rejected',()=>{
 const design={...emptyDesign(),palette:{dark:{accent:'#aabbcc'}}};
 assert.match(visualDesignCss(design),/\[data-theme="dark"\]/);assert.ok(!visualDesignCss(design).includes('[data-theme="light"]'));
 assert.equal(visualDesignSchema.safeParse({...emptyDesign(),elements:{[selector]:{desktop:{offsetX:321}}}}).success,false);
 assert.equal(visualDesignSchema.safeParse({...emptyDesign(),elements:{[selector]:{desktop:{position:'fixed'}}}}).success,false);
 assert.equal(visualDesignCss(emptyDesign()),'');
});
