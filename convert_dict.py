import csv
import json
import re

# 配置：您想要多少个最常用的单词？
MAX_WORDS = 1000000

# 输入文件 (ecdict.csv)
INPUT_FILE = 'ecdict.csv'
# 输出文件
OUTPUT_FILE = 'dictionary_30k.json'

def clean_meaning(meaning_str):
    """清洗释义，只保留最核心的中文意思"""
    if not meaning_str:
        return ""
    # 移除换行符，只取最前面、最简洁的释义部分
    first_meaning = meaning_str.split('\\n')[0].strip()
    return first_meaning

def convert():
    print(f"正在读取 {INPUT_FILE} 并进行筛选...")
    
    selected_words = []
    
    try:
        # 强制使用 'utf-8-sig' 编码解决读取问题
        with open(INPUT_FILE, 'r', encoding='utf-8-sig', newline='') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                word = row.get('word')
                phonetic = row.get('phonetic')
                translation = row.get('translation')
                
                # --- 筛选逻辑：只选取最常用的 N 个词条 ---
                # ECDICT 文件的 'tag' 字段中，'oxford' 表示牛津常用词，'zk' 表示中考，'gk' 表示高考
                # 这一步是为了确保我们选中的词是高频、有用的。
                # 由于原始文件可能按字母顺序排，这里我们只检查前 4万行，避免读取整个巨大文件。

                # 如果没有 'tag' 字段，或者 tag 中不包含 'oxford' 或 'level' 字段（常见于高频词），则跳过
                tags = row.get('tag', '')
                is_high_frequency = 'oxford' in tags or 'level' in tags or 'zk' in tags or 'gk' in tags or row.get('frequency') # 假设有频率字段

                if not is_high_frequency and len(selected_words) > 1000:
                    # 如果不是高频词，并且我们已经收集了足够多的词（1000个），则跳过，加速处理
                    continue

                if word and phonetic and translation:
                    clean_trans = clean_meaning(translation)
                    
                    word_obj = {
                        "word": word,
                        "ipa": f"/{phonetic}/",
                        "meaning": clean_trans
                    }
                    
                    selected_words.append(word_obj)

                if len(selected_words) >= MAX_WORDS:
                    break
                        
        print(f"筛选完成！共选取 {len(selected_words)} 个最常用的词条。")
        
        # --- 写入 JSON：为了稳定，我们采用分步写入 ---
        print(f"正在写入 {OUTPUT_FILE} (文件较大，可能需要几秒)...")
        
        # 写入 JSON 时，使用 utf-8 确保中文显示正常
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
            # 手动写入 JSON 数组的开头
            f_out.write('[\n')
            
            # 逐个写入每个单词对象
            for i, word_obj in enumerate(selected_words):
                # dumps() 将 Python 字典转换为 JSON 字符串
                json_line = json.dumps(word_obj, ensure_ascii=False, indent=2)
                
                # 写入 JSON 行，并控制逗号
                if i > 0:
                    f_out.write(',\n')
                f_out.write(json_line)
                
            # 手动写入 JSON 数组的结尾
            f_out.write('\n]\n')
            
        print(f"成功！文件已保存为: {OUTPUT_FILE}")
        print("请将此文件导入您的 React 项目。")

    except FileNotFoundError:
        print(f"错误：找不到文件 {INPUT_FILE}")
    except Exception as e:
        print(f"处理过程中发生错误: {e}")
        print("请检查CSV文件是否完整或被其他程序占用。")

if __name__ == "__main__":
    convert()