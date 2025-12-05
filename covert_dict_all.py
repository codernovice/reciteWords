import csv
import json
import re

# 输入文件 (ecdict.csv)
INPUT_FILE = 'ecdict.csv'
# 输出文件 (警告: 文件体积将非常大!)
OUTPUT_FILE = 'dictionary_ALL.json'

def clean_meaning(meaning_str):
    """清洗释义，只保留最核心的中文意思"""
    if not meaning_str:
        return ""
    # 移除换行符，只取最前面、最简洁的释义部分
    first_meaning = meaning_str.split('\\n')[0].strip()
    return first_meaning

def convert():
    print(f"警告：正在尝试将 {INPUT_FILE} 中所有词条转换为 JSON。文件体积会非常巨大。")
    print("--------------------------------------------------")
    
    selected_words = []
    
    try:
        # 强制使用 'utf-8-sig' 编码解决读取问题
        with open(INPUT_FILE, 'r', encoding='utf-8-sig', newline='') as f:
            reader = csv.DictReader(f)
            
            for i, row in enumerate(reader):
                word = row.get('word')
                phonetic = row.get('phonetic')
                translation = row.get('translation')
                
                # 过滤：必须有单词、音标和翻译
                if not (word and phonetic and translation):
                    continue
                
                # 构造词条对象
                word_obj = {
                    "word": word,
                    "ipa": f"/{phonetic}/",
                    "meaning": clean_meaning(translation)
                }
                
                selected_words.append(word_obj)

                # 打印进度，避免用户以为程序卡住
                if (i + 1) % 10000 == 0:
                    print(f"已处理 {i + 1} 个词条...")
                        
        total_count = len(selected_words)
        print(f"读取完成！共筛选出 {total_count} 个有效词条。")
        
        # --- 写入 JSON：逐行写入，以确保大型文件不会导致内存溢出 ---
        print(f"正在写入 {OUTPUT_FILE} (文件体积巨大，请耐心等待)...")
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
            # 手动写入 JSON 数组的开头
            f_out.write('[\n')
            
            # 逐个写入每个单词对象
            for i, word_obj in enumerate(selected_words):
                # dumps() 将 Python 字典转换为 JSON 字符串
                json_line = json.dumps(word_obj, ensure_ascii=False, indent=2)
                
                # 控制逗号：除了最后一个元素，后面都需要逗号
                f_out.write(json_line)
                if i < total_count - 1:
                    f_out.write(',\n')
                else:
                    f_out.write('\n')
                
            # 手动写入 JSON 数组的结尾
            f_out.write(']\n')
            
        print(f"转换成功！文件已保存为: {OUTPUT_FILE}")
        print(f"文件大小约为 {round(total_count / 10000, 1)} 万词。")

    except FileNotFoundError:
        print(f"错误：找不到文件 {INPUT_FILE}")
    except Exception as e:
        print(f"处理过程中发生错误: {e}")
        print("请检查CSV文件是否被其他程序占用或文件本身已损坏。")

if __name__ == "__main__":
    convert()